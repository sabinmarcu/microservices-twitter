// eslint-disable-next-line import/prefer-default-export
export const combineWithEnv = (config, { prefix = '', suffix = '' }) => Object.entries(config)
  .reduce(
    (prev, [key, value]) => ({
      ...prev,
      [key]: process.env[`RC_${prefix.toUpperCase()}${key.toUpperCase()}${suffix.toUpperCase()}`] || value,
    }),
    {},
  );
