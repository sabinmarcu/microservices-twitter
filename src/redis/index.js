import { promisify } from 'util';
import redis from 'redis';
import config from './config';

export const client = redis.createClient(config);

export const promisifiedClient = {
  get: promisify(client.get).bind(client),
  set: promisify(client.set).bind(client),
};

export default promisifiedClient;
