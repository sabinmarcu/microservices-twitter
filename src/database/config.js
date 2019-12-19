import { combineWithEnv } from '../utils';

export const baseConfig = {
  url: 'localhost:4747',
  user: 'root',
  password: '',
};

export const envConfig = combineWithEnv(baseConfig, { prefix: 'neo4j_' });

export default envConfig;
