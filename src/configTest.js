console.log(
  Object.entries(process.env)
    .filter(([key]) => key.startsWith('RC_')),
);
