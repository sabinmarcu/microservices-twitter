/* eslint-disable camelcase */
import { internet } from 'faker';
import debug from '../../log';
import makeRoute from '../shared';
import makeLimiter from '../rate';

const accounts = [];
const accountsMap = {};
const relationships = {};
const bindAccounts = (a, b) => {
  if (!relationships[a.user_id]) {
    relationships[a.user_id] = [];
  }
  relationships[a.user_id].push(b.user_id);
  relationships[a.user_id] = relationships[a.user_id]
    .sort()
    .filter((it, index, arr) => arr.indexOf(it) === index);
};

const [rstart, rend] = (process.env.RC_TWITTER_FRIENDS_RANGE || '3:5')
  .split(':')
  .map((it) => parseInt(it, 10));

const makeAccount = (username, log) => {
  const user_id = username || internet.userName();
  if (!accountsMap[user_id]) {
    const account = ({
      user_id,
    });
    accounts.push(account);
    accountsMap[user_id] = account;
    log('Created account %s', user_id);
  }
  return accountsMap[user_id];
};

export default (server, logger) => {
  const log = debug('friends', logger);
  const limit = process.env.RC_TWITTER_LIMIT || 5;
  const timeout = process.env.RC_TWITTER_REFRESH || 5000;
  log('Starting limiter with a limit of %d and timeout interval of %ds', limit, timeout / 1000);
  const limiter = makeLimiter(limit, timeout, log);
  makeRoute(
    server,
    'friends/list',
    log,
    (req, res) => {
      const canServe = limiter.consume();
      if (canServe < 0) {
        log.error('Rate limit reached');
        res.json({ success: false, message: 'Rate limit reached' });
        return;
      }

      const { user_id } = req.query;
      if (!user_id) {
        log.error('Requested without user_id');
        res.json({ success: false, message: 'No user_id supplied' });
        return;
      }

      log('Finding', user_id);
      let account = accountsMap[user_id];
      if (account) {
        log('Found', account);
      } else {
        log('Creating new account');
        account = makeAccount(user_id, log);
      }
      if (!relationships[user_id]) {
        log('Will generate between %d and %d friends', rstart, rend);

        const total = parseInt(Math.random() * (rend - rstart), 10) + rstart;
        const take = Math.min(
          Math.floor(total / 2),
          accounts
            .filter(({ user_id: it }) => it !== user_id)
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
            } while (acc.user_id === user_id || list.find(({ user_id: it }) => it === user_id));
            list.push(acc);
          }
          return list;
        })();

        [created, taken]
          .flat()
          .forEach((acc) => bindAccounts(account, acc));
      }

      res.json(relationships[user_id].map((it) => accountsMap[it]));
    },
  );
};
