import connectNeo4j from './neo4j';
import Mongo from './appMongo';
import debug from './log';

const log = debug('importer');

const cleanup = [];
(async () => {
  const { close, session: neo4j } = await connectNeo4j(log);
  cleanup.push(close);
  const db = new Mongo(log);
  await db.ready();
  log('Setup Done');
  log('Cleanup');
  await neo4j.run('MATCH (n) DETACH DELETE n');
  log('Grabbing users from Mongo');
  const users = await db.getUsers();
  log('Importing %d users', users.length);
  await Promise.all(
    users.map(
      (it) => neo4j.run(
        'CREATE (a:Account { screen_name: $screen_name }) RETURN a',
        it,
      ),
    ),
  );
  log('Importing Relationships');
  await Promise.all(
    users.map(
      (it) => Promise.all(
        (it.friends || [])
          .filter((i, index, arr) => arr.indexOf(i) === index)
          .map((friend) => neo4j.run(
            `
              MATCH (a:Account),(b:Account)
              WHERE a.screen_name = $first AND b.screen_name = $second
              CREATE (a)-[r:Follows]->(b)
              RETURN r
            `,
            { first: it.screen_name, second: friend },
          )),
      ),
    ),
  );
  log('All Done');
})()
  .then(() => process.exit(0))
  .catch(async (e) => {
    log.error('Error: ', e);
    await Promise.all(cleanup.map((it) => it.close && it.close()));
    process.exit(1);
  });
