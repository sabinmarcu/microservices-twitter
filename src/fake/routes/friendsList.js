/* eslint-disable no-await-in-loop */
/* eslint-disable import/no-dynamic-require,camelcase */
import fs from 'fs';
import path from 'path';
import debug from '../../log';
import makeRoute from '../shared';
import { makeLimiter } from '../rate';

export const endpoint = '/friends/list';
const Driver = require(`../drivers/${process.env.RC_FAKE_DRIVER || 'memory'}`).default;

const [rstart, rend] = (process.env.RC_TWITTER_FRIENDS_RANGE || '3:5')
  .split(':')
  .map((it) => parseInt(it, 10));

export default async (server, logger) => {
  const log = debug('friends', logger);
  const limit = process.env.RC_TWITTER_LIMIT || 5;
  const timeout = process.env.RC_TWITTER_REFRESH || 5000;
  log('Starting limiter with a limit of %d and timeout interval of %ds', limit, timeout / 1000);
  const limiter = makeLimiter(limit, timeout, log);
  const driver = new Driver(log);
  await driver.ready();
  makeRoute(
    server,
    endpoint,
    log,
    async (req, res) => {
      const canServe = limiter.consume();
      if (canServe < 0) {
        log.error('Rate limit reached');
        res.json({ success: false, message: 'Rate limit reached' });
        return;
      }

      const {
        screen_name,
        cursor: cursorStr,
        count: countStr = '2',
      } = req.query;
      const cursor = parseInt(cursorStr, 10);
      const count = parseInt(countStr, 10);
      if (!screen_name) {
        log.error('Requested without screen_name');
        res.json({ success: false, message: 'No screen_name supplied' });
        return;
      }

      log('Finding', screen_name);
      const account = await driver.getAccount(screen_name);

      log('Found', account);
      if (!(await driver.hasFriends(screen_name))) {
        log('Will generate between %d and %d friends', rstart, rend);

        const total = parseInt(Math.random() * (rend - rstart), 10) + rstart;
        const take = Math.min(
          Math.floor((total / 5) * 4),
          (await driver.getAccountsWithout(screen_name)).length,
        );
        const create = total - take;

        log('Generating %d friends, of which %d existing and %d to create', total, take, create);

        const created = await Promise.all(
          (new Array(create))
            .fill(0)
            .map(() => driver.getAccount()),
        );

        const taken = await (async () => {
          const list = [];
          while (list.length < take) {
            log('Loop');
            const acc = await driver.getRandomAccount([
              screen_name,
              ...list.map(({ screen_name: it }) => it),
            ]);
            list.push(acc);
          }
          return list;
        })();

        log('Created', created);
        log('Taken', taken);

        await [created, taken]
          .flat()
          .reduce((p, acc) => p.then(() => driver.bindAccounts(account, acc)), Promise.resolve());
      }

      let users = await driver.getFriendsOf(screen_name);
      let next_cursor = -1;
      if (typeof cursorStr !== 'undefined' && count) {
        const len = users.length;
        const currentCursor = cursor === -1 ? 0 : cursor;
        log('Filtering through cursor %d (count %d)', currentCursor, count);
        log('Selecting indices [%d, %d]', currentCursor, currentCursor + count - 1);
        users = users.filter(
          (it, index) => (index >= currentCursor) && (index < currentCursor + count),
        );
        next_cursor = currentCursor + count;
        if (next_cursor >= len) {
          next_cursor = 0;
        }
      }

      log('Sending', { users, next_cursor });
      res.json({
        users,
        next_cursor,
      });
    },
  );
};
