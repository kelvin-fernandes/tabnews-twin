let response;
let responseData;
let migrationsResponse;

beforeAll(async () => {
  response = await fetch("http://localhost:3000/api/v1/status");
  responseData = await response.json();
});

describe("GET /api/v1/status", () => {
  describe("anonymous user", () => {
    describe("retrieving current system status", () => {

      test("should return 200", async () => {
        expect(response.status).toBe(200);
      });

      test("should return dependencies status", async () => {
        const updatedAt = responseData.updated_at;
        const parsedUpdatedAt = new Date(updatedAt).toISOString();
        expect(updatedAt).toBeDefined();
        expect(updatedAt).toEqual(parsedUpdatedAt);

        const databaseStatus = responseData.dependencies.database.status;
        expect(databaseStatus).toEqual("healthy");

        const databaseVersion = responseData.dependencies.database.version;
        expect(databaseVersion).toBeDefined();
        expect(databaseVersion).toEqual("16.0");

        const databaseMaxConnections = responseData.dependencies.database.max_connections;
        expect(databaseMaxConnections).toBeDefined();
        expect(databaseMaxConnections).toBeGreaterThan(0);
        expect(typeof databaseMaxConnections).toBe("number");

        const databaseOpenedConnections =
          responseData.dependencies.database.opened_connections;
        expect(databaseOpenedConnections).toBeDefined();
        expect(databaseOpenedConnections).toEqual(1);
        expect(typeof databaseOpenedConnections).toBe("number");
      });
    });
  });
});