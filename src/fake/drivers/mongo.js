/* eslint-disable camelcase */
import { internet } from 'faker';
import { Interface } from './interface';
import { getConnection } from '../../mongo';
import config from '../../mongo/config';

export class MongoDriver extends Interface {
  client

  collection

  constructor(log) {
    super(log, 'mongo');
  }

  ready = async () => {
    this.client = await getConnection();
    this.db = await this.client.db(config.db);
    this.collection = this.db.collection(process.env.RC_MONGO_COLLECTION || 'fake');
    return true;
  }

  getAccount = async (id) => {
    const screen_name = id || internet.userName();
    let account = await this.collection.findOne({ screen_name });
    if (!account) {
      account = ({
        screen_name,
      });
      await this.collection.insertOne(account);
      this.log('Created account %s', screen_name);
    }
    return account;
  }

  hasFriends = async (id) => {
    const account = await this.getAccount(id);
    return !!account.friends;
  }

  getAccountsWithout = async (id) => this.collection.find({ screen_name: { $ne: id } }).toArray()

  getRandomAccount = async () => this.collection.aggregate({}, { sample: 1 }).toArray();

  bindAccounts = async (a, b) => {
    const accA = await this.getAccount(a.screen_name);
    const accB = await this.getAccount(b.screen_name);
    accA.friends = accA.friends || [];
    accA.friends.push(accB.screen_name);
    return this.collection.updateOne(
      { screen_name: accA.screen_name },
      { $set: { friends: accA.friends } },
    );
  }

  getFriendsOf = async (id) => {
    const acc = await this.getAccount(id);
    if (!acc.friends) {
      this.log.error('Account %s has no friends saved!', id);
    }
    return Promise.all((acc.friends || []).map(this.getAccount));
  }
}

export default MongoDriver;
