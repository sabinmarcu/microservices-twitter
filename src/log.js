/* eslint-disable no-underscore-dangle */
const debug = require('debug');

const appPrefix = process.env.DEBUG_APP || 'app';

const mergeDebug = (it) => it
  .concat(process.env.DEBUG
    ? process.env.DEBUG.split(',')
    : []);

const makeLogger = (name, parent) => {
  const parts = [];
  if (parent && parent.__designation) {
    parts.push(parent.__designation);
  }
  parts.push(name);
  const logger = {
    __designation: parts.join(':'),
    log: debug([appPrefix, 'log'].concat(parts).join(':')),
    error: debug([appPrefix, 'error'].concat(parts).join(':')),
    warn: debug([appPrefix, 'warn'].concat(parts).join(':')),
    info: debug([appPrefix, 'info'].concat(parts).join(':')),
  };
  const f = logger.log.bind(logger);
  Object.entries(logger)
    .forEach(([key, value]) => {
      if (value instanceof Function) {
        f[key] = value.bind(logger);
      } else {
        f[key] = value;
      }
    });
  return f;
};


let debugs = process.env.DEBUG ? process.env.DEBUG.split(',') : [];

const refreshDebug = () => {
  debugs = debugs
    .sort()
    .filter((it, index, arr) => arr.indexOf(it) === index);
  debug.enable(debugs.join(','));
};

const enableBootstrap = () => {
  debugs.push([appPrefix, 'bootstrap'].join(':'));
  refreshDebug();
};

const loadDesignation = (...designations) => {
  debugs.concat(designations);
  refreshDebug();
};

const loadFromEnv = () => {
  debugs = mergeDebug(debugs);
  refreshDebug();
};

const enabled = () => debugs;

module.exports = makeLogger;
module.exports.loadDesignation = loadDesignation;
module.exports.loadFromEnv = loadFromEnv;
module.exports.enableBootstrap = enableBootstrap;
module.exports.enabled = enabled;
