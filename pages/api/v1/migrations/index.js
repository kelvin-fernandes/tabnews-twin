import migrationRunner from "node-pg-migrate";
import { resolve } from "node:path";
import database from "infra/database.js";

export default async function migrations(request, response) {
  const allowedMethods = ["GET", "POST"];
  if (!allowedMethods.includes(request.method)) {
    return response
      .status(405)
      .json({ error: `Method ${request.method} not allowed` });
  }

  let dbClient;
  try {
    dbClient = await database.connect();
    const defaultMigrationsOptions = {
      dryRun: true,
      dbClient: dbClient,
      dir: resolve("infra", "migrations"),
      direction: "up",
      verbose: true,
      migrationsTable: "pgmigrations",
    };

    if (request.method === "GET") {
      const pendingMigrations = await migrationRunner(defaultMigrationsOptions);
      return response.status(200).json(pendingMigrations);
    }

    if (request.method === "POST") {
      const migratedMigrations = await migrationRunner({
        ...defaultMigrationsOptions,
        dryRun: false,
      });
      return response.status(201).json(migratedMigrations);
    }
  } catch (error) {
    console.error("Migration error:", error);
    return response.status(500).json({ error: "Internal Server Error" });
  } finally {
    await dbClient.end();
  }
}
