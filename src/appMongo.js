/* eslint-disable camelcase */
import connect from './mongo';
import config from './mongo/config';
import debug from './log';

class MongoHandler {
  constructor(logger, dbName = 'dump') {
    this.log = debug('mongo', logger);
    this.logger = logger;
    this.dbName = dbName;
  }

  ready = async () => {
    this.log('Connecting');
    const client = await connect(this.logger);
    const db = await client.db(config.db);
    const usersDb = this.dbName;
    this.log('Connecting to %s', usersDb);
    this.users = db.collection(usersDb);
    const infoDb = [this.dbName, 'info'].join('_');
    this.log('Connecting to %s', infoDb);
    this.info = db.collection(infoDb);
    this.log('Done');
  }

  getUser = async (screen_name) => {
    const user = await this.users.findOne({ screen_name });
    if (user) {
      return user;
    }
    const newUser = { screen_name };
    await this.users.insertOne(newUser);
    return newUser;
  }

  getUsers = () => this.users.find().toArray();

  addFriendToUser = async (
    inputUser,
    inputFriend,
  ) => {
    const [user, friend] = await Promise.all(
      [inputUser, inputFriend]
        .map((it) => this.getUser(it.screen_name || it)),
    );
    if (!user.friends) {
      user.friends = [];
    }
    this.log('Adding friend to user', friend.screen_name, user.screen_name);
    user.friends.push(friend.screen_name);
    this.users.update({ screen_name: user.screen_name }, user);
    return user;
  }

  getInfo = async () => {
    const info = await this.info.findOne({});
    if (info) {
      return info;
    }
    const newInfo = { queue: [], cursor: null };
    await this.info.insertOne(newInfo);
    return newInfo;
  }

  getCursor = async () => (await this.getInfo()).cursor

  setCursor = async (screen_name, cursor, depth = 0) => {
    this.log('Setting cursor to', { screen_name, cursor, depth });
    const info = await this.getInfo();
    info.cursor = { screen_name, cursor, depth };
    this.log('Setting info to', info);
    await this.info.update({}, info);
    return info.cursor;
  }

  getQueue = async () => (await this.getInfo()).queue

  addToQueue = async (screen_name, depth) => {
    const info = await this.getInfo();
    info.queue.push({ screen_name, depth });
    await this.info.update({}, info);
    return info.queue;
  }

  popFromQueue = async () => {
    const info = await this.getInfo();
    const screen_name = info.queue.shift();
    await this.info.update({}, info);
    return screen_name;
  }
}

export default MongoHandler;
