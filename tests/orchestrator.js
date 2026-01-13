import retry from "async-retry";
import database from "infra/database.js";

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

const orchestrator = { waitForAllServices, clearDatabase };

export default orchestrator;
