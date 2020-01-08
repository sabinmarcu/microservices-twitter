/* eslint-disable camelcase */
/* eslint-disable no-await-in-loop */
import chalk from 'chalk';
import debug from './log';
import Twitter from './appTwitter';

const log = debug('importer');

const count = 1;
(async () => {
  const handle = process.env.QUERY || process.argv[2];

  if (!handle) {
    log.error('No handle supplied!');
    process.exit(1);
  }

  const twitter = new Twitter({ handle, logger: log, count });
  await twitter.ready();
  await twitter.start();

  // const user = await db.getUser(handle);
  // const data = await twitter.get('friends/list', { screen_name: user.screen_name });
  // await Promise.all(data.users.map(({ screen_name }) => db.getUser(screen_name)));

  // const cursor = await db.getCursor();
  // const queue = await db.getQueue();

  // do {
  //   const item = queue[0];
  //   log.info(`Importing friends of ${chalk.green(item)}, cursor ${chalk.magenta(cursor)}`);
  //   const query = { screen_name: handle, cursor, count: 200 };
  //   log('Query:', JSON.stringify(query));
  //   do {
  //     const data = await twitter.get(
  //       'friends/list',
  //       query,
  //     );
  //     log(data.users.length, data.users[0].screen_name);
  //     cursor = data.next_cursor;
  //     queue = [...queue, ...data.users.map((it) => it.screen_name)];
  //     await redis.set(queueKey, JSON.stringify(queue));
  //     await redis.set(cursorKey, JSON.stringify(cursorEncoder.encode(handle, cursor)));
  //     await debugRedis();
  //   } while (cursor !== 0);
  //   queue.shift();
  //   await redis.set(queueKey, JSON.stringify(queue));
  //   await debugRedis();
  // } while (queue.length > 0);

  // return 0;
})().then(process.exit).catch((e) => {
  log.error(`${chalk.red('ERROR:')}`, e);
  process.exit(1);
});
// getFriends(process.argv[2]);
