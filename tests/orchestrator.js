import retry from "async-retry";
import database from "infra/database.js";
import migrator from "models/migrator.js";

async function waitForAllServices() {
  await waitForWebServer();

  async function waitForWebServer() {
    await retry(
      async () => {
        const response = await fetch("http://localhost:3000/api/v1/status");

        if (!response.ok) {
          throw new Error("Web server not ready");
        }
      },
      {
        retries: 50,
        maxTimeout: 1000,
      },
    );
  }
}

async function clearDatabase() {
  await database.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
}

async function runPendingMigrations() {
  await migrator.runPendingMigrations();
}

const orchestrator = { waitForAllServices, clearDatabase, runPendingMigrations };

export default orchestrator;
