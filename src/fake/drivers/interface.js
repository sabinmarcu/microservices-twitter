/* eslint-disable no-unused-vars */
import debug from '../../log';

export class Interface {
  constructor(log, name = this.name) {
    this.log = debug(name, log);
  }

  ready = async () => { throw new Error('Not Implemented!'); }

  getAccount = async (id) => { throw new Error('Not Implemented!'); }

  getRandomAccount = async () => { throw new Error('Not Implemented!'); }

  bindAccounts = async (a, b) => { throw new Error('Not Implemented!'); }

  hasFriends = async (id) => { throw new Error('Not Implemented!'); }

  getAccountsWithout = async (id) => { throw new Error('Not Implemented!'); }

  getFriendsOf = async (id) => { throw new Error('Not Implemented!'); }
}

export default Interface;
