/* eslint-disable no-await-in-loop */
/* eslint-disable camelcase */
import debug from './log';
import twitter from './twitter';
import Mongo from './appMongo';

class TwitterHandler {
  constructor({ handle, logger, count = 1 }) {
    this.handle = handle;
    this.count = count;
    this.log = debug('twitter', logger);
    this.db = new Mongo(logger);
    this.log('Importing tree for %s', handle);
  }

  ready = async () => {
    await this.db.ready();
    this.log('Twitter Ready');
  }

  getCursor = async () => {
    const cursor = await this.db.getCursor();
    if (!cursor || !cursor.screen_name || !cursor.cursor) {
      const queue = await this.db.getQueue();
      if (!queue || queue.length === 0) {
        return this.db.setCursor(this.handle, -1);
      }
      const { screen_name, depth } = await this.db.popFromQueue();
      return this.db.setCursor(screen_name, -1, depth);
    }
    return cursor;
  }

  start = async () => {
    let result;
    let queue;
    do {
      do {
        result = await this.progressQueue();
        if (!result) {
          await (new Promise(
            (accept) => this.log('Waiting') || setTimeout(accept, 1000),
          ));
        }
      } while (!result);
      queue = await this.db.getQueue();
      this.log('Queue', queue);
    } while (queue.length > 0);
  }

  progressQueue = async () => {
    const cursor = await this.getCursor();
    this.log('Progressing Cursor', cursor);
    const data = await twitter.get('friends/list', {
      count: this.count,
      screen_name: cursor.screen_name,
      cursor: cursor.cursor,
    });
    if (data.users) {
      this.log('Got data', data);
      const { users, next_cursor } = data;
      this.log('Processing users', users);
      await Promise.all(
        users.map(
          async (user) => {
            this.log('Adding friend to user', user, cursor.screen_name);
            await this.db.addFriendToUser(
              cursor.screen_name,
              user,
            );
            this.log('Checking depth', cursor.depth);
            if (cursor.depth < 2) {
              this.log('Adding to queue');
              await this.db.addToQueue(user.screen_name, cursor.depth + 1);
            }
          },
        ),
      );
      this.log('Processing cursor', next_cursor);
      if (next_cursor !== 0) {
        await this.db.setCursor(cursor.screen_name, next_cursor, cursor.depth);
      } else {
        const queue = await this.db.getQueue();
        if (queue && queue.length > 0) {
          const { screen_name: user, depth } = await this.db.popFromQueue();
          await this.db.setCursor(user, next_cursor, depth);
        }
      }
      return true;
    }
    this.log.warn('Weird response', data);
    return false;
  }
}

export default TwitterHandler;
