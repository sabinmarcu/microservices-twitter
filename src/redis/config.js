import { combineWithEnv } from '../utils';

export const baseConfig = {
  host: '0.0.0.0',
  port: '6379',
};

export const envConfig = combineWithEnv(baseConfig, { prefix: 'redis_' });

export default envConfig;
