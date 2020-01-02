/* eslint-disable global-require,import/no-dynamic-require */
import Express from 'express';
import path from 'path';
import fs from 'fs';
import debug from '../log';

const log = debug('fake');
(async () => {
  const server = new Express();
  const routesDir = path.resolve(__dirname, 'routes');
  log('Loading routes from', routesDir);
  await Promise.all(
    fs.readdirSync(routesDir)
      .map((f) => [f, path.resolve(routesDir, f)])
      .map(([_, p]) => [_, require(p)])
      .map(([_, r]) => [_, r.default || r])
      .map(([f, r]) => log('Loading routes from', f) || r(server, log)),
  );

  const port = process.env.RC_TWITTER_PORT || '5000';
  const host = process.env.RC_TWITTER_HOST || '0.0.0.0';
  log.info('Server listening on', `${host}:${port}`);
  server.listen(port, host);
})()
  .catch((e) => {
    log.error('Error caught', e);
    process.exit(1);
  });
