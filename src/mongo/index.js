import { MongoClient } from 'mongodb';
import config from './config';
import debug from '../log';

export const baseUrl = `mongodb://${config.host}:${config.port}/${config.db}`;

export const getConnection = async (url = baseUrl, log) => {
  if (log) {
    log('Attempting connection to %s', baseUrl);
  }
  return MongoClient.connect(url, { useUnifiedTopology: true });
};

let defaultDB = null;
export default async (logger) => {
  const log = debug('mongoDriver', logger);
  log('Initializing driver');
  if (!defaultDB) {
    defaultDB = await getConnection(baseUrl, log);
  }
  return defaultDB;
};
