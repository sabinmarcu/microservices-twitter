import neo4j from 'neo4j-driver';
import dbConfig from './config';
import debug from '../log';

const connect = async (logger) => {
  const log = debug('neo4j', logger);
  const config = {
    url: `bolt://${dbConfig.url}`,
    credentials: [
      dbConfig.user,
      dbConfig.password,
    ],
  };
  log('Attempting connection with', config);
  const driver = neo4j.driver(
    config.url,
    neo4j.auth.basic(...config.credentials),
  );
  const run = async (...args) => {
    const session = driver.session();
    await session.run(...args);
    await session.close();
  };
  return {
    session: {
      run,
    },
    close: driver.close,
  };
};

export default connect;
