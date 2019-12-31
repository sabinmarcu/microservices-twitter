/* eslint-disable camelcase */
import { internet } from 'faker';
import debug from '../../log';
import makeRoute from '../shared';
import { makeLimiter } from '../rate';

export const endpoint = '/friends/list';

const accounts = [];
const accountsMap = {};
const relationships = {};
const bindAccounts = (a, b) => {
  if (!relationships[a.screen_name]) {
    relationships[a.screen_name] = [];
  }
  relationships[a.screen_name].push(b.screen_name);
  relationships[a.screen_name] = relationships[a.screen_name]
    .sort()
    .filter((it, index, arr) => arr.indexOf(it) === index);
};

const [rstart, rend] = (process.env.RC_TWITTER_FRIENDS_RANGE || '3:5')
  .split(':')
  .map((it) => parseInt(it, 10));

const makeAccount = (username, log) => {
  const screen_name = username || internet.userName();
  if (!accountsMap[screen_name]) {
    const account = ({
      screen_name,
    });
    accounts.push(account);
    accountsMap[screen_name] = account;
    log('Created account %s', screen_name);
  }
  return accountsMap[screen_name];
};

export default (server, logger) => {
  const log = debug('friends', logger);
  const limit = process.env.RC_TWITTER_LIMIT || 5;
  const timeout = process.env.RC_TWITTER_REFRESH || 5000;
  log('Starting limiter with a limit of %d and timeout interval of %ds', limit, timeout / 1000);
  const limiter = makeLimiter(limit, timeout, log);
  makeRoute(
    server,
    endpoint,
    log,
    (req, res) => {
      const canServe = limiter.consume();
      if (canServe < 0) {
        log.error('Rate limit reached');
        res.json({ success: false, message: 'Rate limit reached' });
        return;
      }

      const { screen_name } = req.query;
      if (!screen_name) {
        log.error('Requested without screen_name');
        res.json({ success: false, message: 'No screen_name supplied' });
        return;
      }

      log('Finding', screen_name);
      let account = accountsMap[screen_name];
      if (account) {
        log('Found', account);
      } else {
        log('Creating new account');
        account = makeAccount(screen_name, log);
      }
      if (!relationships[screen_name]) {
        log('Will generate between %d and %d friends', rstart, rend);

        const total = parseInt(Math.random() * (rend - rstart), 10) + rstart;
        const take = Math.min(
          Math.floor(total / 2),
          accounts
            .filter(({ screen_name: it }) => it !== screen_name)
            .length,
        );
        const create = total - take;

        log('Generating %d friends, of which %d existing and %d to create', total, take, create);

        const created = (new Array(create))
          .fill(0)
          .map(() => makeAccount(null, log));

        const taken = (() => {
          const list = [];
          while (list.length < take) {
            let acc;
            do {
              acc = accounts[parseInt(Math.random() * accounts.length, 10)];
            } while (
              acc.screen_name === screen_name
              || list.find(({ screen_name: it }) => it === screen_name)
            );
            list.push(acc);
          }
          return list;
        })();

        [created, taken]
          .flat()
          .forEach((acc) => bindAccounts(account, acc));
      }

      res.json(relationships[screen_name].map((it) => accountsMap[it]));
    },
  );
};
