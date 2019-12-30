export default (server, route, log, handler) => {
  const r = `/${route.replace(/^\/*/, '')}`;
  log('REGISTER', r);
  server.get(r, (...args) => {
    log('REQUEST', r);
    return handler(...args);
  });
};
