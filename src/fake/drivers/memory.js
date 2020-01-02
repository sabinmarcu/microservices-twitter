/* eslint-disable camelcase */
import { internet } from 'faker';
import { Interface } from './interface';

export class InMemoryDriver extends Interface {
  accounts = [];

  accountsMap = {};

  relationships = {};

  constructor(log) {
    super(log, 'inmemory');
  }

  ready = async () => true

  getAccount = async (id) => {
    const screen_name = id || internet.userName();
    if (!this.accountsMap[screen_name]) {
      const account = ({
        screen_name,
      });
      this.accounts.push(account);
      this.accountsMap[screen_name] = account;
      this.log('Created account %s', screen_name);
    }
    return this.accountsMap[screen_name];
  }

  hasFriends = async (id) => !this.relationships[id]

  getAccountsWithout = async (id) => this.accounts
    .filter(({ screen_name: it }) => it !== id)

  getRandomAccount = async () => this.accounts[parseInt(Math.random() * this.accounts.length, 10)]

  bindAccounts = async (a, b) => {
    if (!this.relationships[a.screen_name]) {
      this.relationships[a.screen_name] = [];
    }
    this.relationships[a.screen_name].push(b.screen_name);
    this.relationships[a.screen_name] = this.relationships[a.screen_name]
      .sort()
      .filter((it, index, arr) => arr.indexOf(it) === index);
  }

  getFriendsOf = async (id) => this.relationships[id].map((it) => this.accountsMap[it])
}

export default InMemoryDriver;
