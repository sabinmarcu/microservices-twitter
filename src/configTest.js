import debug from './log';

const designation = 'test';
debug.loadDesignation(designation);

const log = debug(designation);

const vars = [
  [['DEBUG', debug.enabled().join(', ')]],
  Object.entries(process.env)
    .filter(([key]) => key.startsWith('RC_')),
].flat();

const maxKey = vars.reduce((prev, [it]) => (prev > it.length ? prev : it.length), 0);
const space = new Array('bootstrap'.length - designation.length).fill(' ').join('');

console.log('\n\n');

vars.forEach(([key, value]) => log(
  '%s%s = %s',
  space,
  key + Array(Math.max(0, maxKey - key.length)).fill(' ').join(''),
  value,
));
