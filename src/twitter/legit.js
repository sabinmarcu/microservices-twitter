import { promisify } from 'util';
import Twitter from 'twitter';
import twitterConfig from './config';
import debug from '../log';

const log = debug('api:fake');

log('Api loading');
export const client = new Twitter(twitterConfig);
export const promisifiedClient = {
  get: promisify(client.get).bind(client),
};

export default promisifiedClient;
