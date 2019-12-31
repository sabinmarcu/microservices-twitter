import fetch from 'node-fetch';
import URI from 'urijs';
import twitterConfig from './config';
import debug from '../log';

const log = debug('api:fake');

const endpoint = `http://${twitterConfig.endpoint}`;
log('Api Consuming %s', endpoint);

export const client = {
  get: (url, screenName) => {
    log('Requested %s with query %s', url, screenName);
    const uri = new URI(endpoint);
    uri.addFragment(url);
    uri.addQuery('screen_name', screenName);
    return fetch(uri.toString()).then((data) => data.json());
  },
};

export default client;

// const data = await twitter.get(
//   'friends/list',
//   query,
// );
// log(data.users.length, data.users[0].screen_name);
// cursor = data.next_cursor;
// queue = [...queue, ...data.users.map((it) => it.screen_name)];
