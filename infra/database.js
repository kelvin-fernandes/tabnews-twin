import { Client } from 'pg';

async function connect() {
  const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD
  });
  await client.connect();
  return client;
}

async function query(queryText) {
  const client = await connect();

  const result = await client.query(queryText);

  await client.end();
  return result.rows[0].message;
}

export default { query: query };