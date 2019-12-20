/* eslint-disable no-await-in-loop */
import chalk from 'chalk';
import twitter from './twitter';
import redis from './redis';

const cursorEncoder = {
  encode: (handle, cursor) => `${handle}:${cursor}`,
  decode: (str) => (([handle, cursor]) => ({ handle, cursor }))(str.split(':')),
};

const prefix = chalk.blueBright('>');
(async () => {
  const handle = process.env.QUERY || process.argv[2];
  console.log(`${prefix} Importing tree for ${chalk.yellow(handle)}`);

  const queueKey = `${handle}:queue`;
  const cursorKey = `${handle}:cursor`;

  let queue = JSON.parse(await redis.get(queueKey));
  if (queue && queue.length > 0) {
    console.log(`${prefix} Continuing queue at ${chalk.green(queue[0])}`);
  } else {
    console.log(`${prefix} Starting queue at ${chalk.green(handle)}`);
    queue = [handle];
  }

  let cursor = JSON.parse(await redis.get(cursorKey));
  if (cursor) {
    cursor = cursorEncoder.decode(cursor).cursor;
    console.log(`${prefix} Continuing with cursor ${chalk.magenta(cursor)}`);
  } else {
    cursor = -1;
    console.log(`${prefix} Starting cursor at ${chalk.magenta(cursor)}`);
  }

  const debugRedis = async () => {
    console.log(`${prefix} Redis Queue`, await redis.get(queueKey));
    console.log(`${prefix} Redis Cursor`, await redis.get(cursorKey));
  };

  debugRedis();

  do {
    const item = queue[0];
    console.log(`${prefix} Importing friends of ${chalk.green(item)}, cursor ${chalk.magenta(cursor)}`);
    const query = { screen_name: handle, cursor, count: 200 };
    console.log(`${prefix} Query:`, JSON.stringify(query));
    do {
      const data = await twitter.get(
        'friends/list',
        query,
      );
      console.log(data.users.length, data.users[0].screen_name);
      cursor = data.next_cursor;
      queue = [...queue, ...data.users.map((it) => it.screen_name)];
      await redis.set(queueKey, JSON.stringify(queue));
      await redis.set(cursorKey, JSON.stringify(cursorEncoder.encode(handle, cursor)));
      await debugRedis();
    } while (cursor !== 0);
    queue.shift();
    await redis.set(queueKey, JSON.stringify(queue));
    await debugRedis();
  } while (queue.length > 0);

  return 0;
})().then(process.exit).catch((e) => {
  console.error(`${prefix} ${chalk.red('ERROR:')}`, e);
  process.exit(1);
});
// getFriends(process.argv[2]);
