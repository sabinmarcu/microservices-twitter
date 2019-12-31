import { combineWithEnv } from '../utils';

export const baseConfig = {
  consumer_key: '',
  consumer_secret: '',
  access_token_key: '',
  access_token_secret: '',
  endpoint: '',
};

export const envConfig = combineWithEnv(baseConfig, { prefix: 'twitter_' });

export default envConfig;
