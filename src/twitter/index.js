import Twitter from 'twitter';
import twitterConfig from './config';

export const client = new Twitter(twitterConfig);
export default client;
