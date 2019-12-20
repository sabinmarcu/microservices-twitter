import { promisify } from 'util';
import Twitter from 'twitter';
import twitterConfig from './config';

export const client = new Twitter(twitterConfig);
export const promisifiedClient = {
  get: promisify(client.get).bind(client),
};
export default promisifiedClient;
