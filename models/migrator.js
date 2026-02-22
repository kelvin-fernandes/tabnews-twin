import { resolve } from "node:path";
import migrationRunner from "node-pg-migrate";
import database from "infra/database.js";
import { ServiceError } from "infra/errors";

async function getPendingMigrations() {
  try {
    const pendingMigrations = await runMigrations({ dryRun: false });
    return pendingMigrations;
  } catch (error) {
    const serviceError = new ServiceError({
      cause: error,
      message: "Failed to get pending migrations.",
    });
    console.error(serviceError);
    throw serviceError;
  }
}

async function runPendingMigrations() {
  try {
    const migratedMigrations = await runMigrations({ dryRun: false });
    return migratedMigrations;
  } catch (error) {
    const serviceError = new ServiceError({
      cause: error,
      message: "Failed to run pending migrations.",
    });
    console.error(serviceError);
    throw serviceError;
  }
}

async function runMigrations({ dryRun = true }) {
  let dbClient;

  try {
    dbClient = await database.connect();
    const migratedMigrations = await migrationRunner({
      dir: resolve("infra", "migrations"),
      direction: "up",
      log: () => {},
      migrationsTable: "pgmigrations",
      dbClient,
      dryRun,
    });

    return migratedMigrations;
  } finally {
    await dbClient?.end();
  }
}

const migrator = {
  getPendingMigrations,
  runPendingMigrations,
};

export default migrator;
