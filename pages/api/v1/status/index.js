import database from "/infra/database.js";

async function status(request, response) {
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
}

export default status;
