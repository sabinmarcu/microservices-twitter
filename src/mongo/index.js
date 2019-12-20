import { MongoClient } from 'mongodb';
import config from './config';

export const baseUrl = `mongo://${config.host}:${config.port}/${config.db}`;

export const getConnection = async (url = baseUrl) => MongoClient.connect(url);

let defaultDB = null;
export default async () => {
  if (!defaultDB) {
    defaultDB = await getConnection();
  }
  return defaultDB;
};
