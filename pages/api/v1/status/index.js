import database from "/infra/database.js";
import { InternalServerError } from "/infra/errors.js";

async function status(request, response) {
  try {
    const updatedAt = new Date().toISOString();
    const databaseInfo = await database.getDatabaseInfo();
    response.status(200).json({
      updated_at: updatedAt,
      dependencies: {
        database: {
          status: "healthy",
          version: databaseInfo.dbVersion,
          max_connections: parseInt(databaseInfo.maxConnections),
          opened_connections: parseInt(databaseInfo.openedConnections),
        },
      },
    });
  } catch (error) {
    const errorResponse = new InternalServerError({ cause: error });
    response.status(500).json(errorResponse);
  }
}

export default status;
