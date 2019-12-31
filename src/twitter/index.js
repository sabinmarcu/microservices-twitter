// eslint-disable-next-line import/no-dynamic-require,global-require
export default ((which) => require(`./${which}`).default)(
  process.env.NODE_ENV === 'production' ? 'legit' : 'fake',
);
