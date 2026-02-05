import { createRouter } from "next-connect";
import migrationRunner from "node-pg-migrate";
import { resolve } from "node:path";
import database from "infra/database.js";
import controller from "infra/controller.js"

const router = createRouter();

router.get(getHandler);
router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  let dbClient;

  try {
    dbClient = await getDatabaseConnection();
    const defaultMigrationsOptions = getDefaultMigrationsOptions(dbClient);

    const pendingMigrations = await migrationRunner(defaultMigrationsOptions);
    return response.status(200).json(pendingMigrations);

  } finally {
    await dbClient.end();
  }
}

async function postHandler(request, response) {
  let dbClient;

  try {

    dbClient = await getDatabaseConnection();
    const defaultMigrationsOptions = getDefaultMigrationsOptions(dbClient);

    const migratedMigrations = await migrationRunner({
      ...defaultMigrationsOptions,
      dryRun: false,
    });
    return response.status(201).json(migratedMigrations);
  } finally {
    await dbClient.end();
  }
}

async function getDatabaseConnection() {
  return await database.connect();
}

function getDefaultMigrationsOptions(dbClient) {
  return {
    dryRun: true,
    dbClient: dbClient,
    dir: resolve("infra", "migrations"),
    direction: "up",
    verbose: true,
    migrationsTable: "pgmigrations",
  };
}
