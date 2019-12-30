/* eslint-disable global-require,import/no-dynamic-require */
require('@babel/register');
require('@babel/polyfill');
const dotenv = require('dotenv');
const expand = require('dotenv-expand');
const debug = require('./log');

debug.enableBootstrap();
debug.loadFromEnv();

delete process.env.DEBUG;

const log = debug('bootstrap');

log('Loading global .env');
expand(dotenv.config());

if (process.env.NODE_ENV) {
  const path = require('path');
  const fs = require('fs');
  const envPath = path.resolve(__dirname, '../', `.env.${process.env.NODE_ENV}`);
  if (fs.existsSync(envPath)) {
    log('Loading', `.env.${process.env.NODE_ENV}`);
    expand(dotenv.config({ path: envPath }));
  }
}

log('Reseting debug based on .envs');
debug.loadFromEnv();

const script = process.env.NODE_SCRIPT || 'app';
log('Starting script', script);
require(`./${script}`);
