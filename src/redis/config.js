import { combineWithEnv } from '../utils';

export const baseConfig = {
  host: 'localhost',
  port: '6379',
};

export const envConfig = combineWithEnv(baseConfig, { prefix: 'redis_' });

export default envConfig;
