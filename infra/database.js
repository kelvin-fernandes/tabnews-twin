import { Client } from "pg";

async function connect() {
  try {
    const client = new Client({
      host: process.env.POSTGRES_HOST,
      port: process.env.POSTGRES_PORT,
      database: process.env.POSTGRES_DB,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      ssl: getSSLValues(),
    });
    await client.connect();
    return client;
  } catch (error) {
    console.error("Error connecting to the database:", error);
    throw error;
  }
}

async function getDatabaseInfo() {
  let client;
  try {
    client = await connect();
    const dbVersion = (await client.query("SHOW server_version;")).rows[0]
      .server_version;
    const maxConnections = (await client.query("SHOW max_connections;")).rows[0]
      .max_connections;
    const openedConnections = (
      await client.query({
        text: "SELECT COUNT(*) FROM pg_stat_activity WHERE datname = $1;",
        values: [process.env.POSTGRES_DB],
      })
    ).rows[0].count;

    return { dbVersion, maxConnections, openedConnections };
  } catch (error) {
    console.error("Error fetching database info:", error);
    throw error;
  } finally {
    await client.end();
  }
}

async function query(text, params) {
  const client = await connect();

  try {
    return await client.query(text, params);
  } catch (error) {
    console.error("Error querying database:", error);
    throw error;
  } finally {
    await client.end();
  }
}

function getSSLValues() {
  if (process.env.POSTGRES_CA) return { ca: process.env.POSTGRES_CA };

  return process.env.NODE_ENV === "production";
}

export default { connect, getDatabaseInfo, query };
