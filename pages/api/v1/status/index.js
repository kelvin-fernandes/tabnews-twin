import { createRouter } from "next-connect";
import database from "/infra/database.js";
import controller from "infra/controller.js"

const router = createRouter();

router.get(getHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
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
