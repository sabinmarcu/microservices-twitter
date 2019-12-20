import { v1 as neo4j } from 'neo4j-driver';
import dbConfig from './dbConfig';

export const driver = neo4j.driver(
  dbConfig.uri,
  neo4j.auth.basic(
    dbConfig.user,
    dbConfig.password,
  ),
);

export const session = driver.session();

export default session;
