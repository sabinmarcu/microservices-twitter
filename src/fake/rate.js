import makeLogger from '../log';

export const makeLimiter = (limit, timeout, parentLogger, autoStart = true) => {
  let requests = 0;
  let interval;

  const log = makeLogger('limiter', parentLogger);

  const start = () => {
    log('Starting refresh interval');
    interval = setInterval(
      () => {
        if (requests > 0) {
          log('Refreshed requests');
          requests = 0;
        }
      },
      timeout,
    );
  };

  const stop = () => {
    log('Stopping refresh interval');
    clearInterval(interval);
    requests = 0;
    interval = undefined;
  };

  const consume = () => {
    log('Consuming a request (so far: %d/%d)', Math.min(requests, limit), limit);
    if (requests <= limit) {
      requests += 1;
    }
    return limit - requests;
  };

  if (autoStart) {
    log('Autostarting');
    start();
  }

  return {
    start,
    stop,
    consume,
  };
};

export default makeLimiter;
