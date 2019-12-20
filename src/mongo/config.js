import { combineWithEnv } from '../utils';

export const baseConfig = {
  host: 'localhost',
  port: '27017',
  db: 'tweets',
};

export const envConfig = combineWithEnv(baseConfig, { prefix: 'redis_' });

export default envConfig;
