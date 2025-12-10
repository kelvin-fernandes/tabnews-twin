test("GET /api/v1/status should return 200", async () => {
  const response = await fetch("http://localhost:3000/api/v1/status");
  expect(response.status).toBe(200);
});

test("GET /api/v1/status should return dependencies status", async () => {
  const response = await fetch("http://localhost:3000/api/v1/status");
  const data = await response.json();

  const updatedAt = data.updated_at;
  const parsedUpdatedAt = new Date(updatedAt).toISOString();
  expect(updatedAt).toBeDefined();
  expect(updatedAt).toEqual(parsedUpdatedAt);

  const databaseStatus = data.dependencies.database.status;
  expect(databaseStatus).toEqual("healthy");

  const databaseVersion = data.dependencies.database.version;
  expect(databaseVersion).toBeDefined();
  expect(databaseVersion).toEqual("16.0");

  const databaseMaxConnections = data.dependencies.database.max_connections;
  expect(databaseMaxConnections).toBeDefined();
  expect(databaseMaxConnections).toBeGreaterThan(0);
  expect(typeof databaseMaxConnections).toBe("number");

  const databaseOpenedConnections =
    data.dependencies.database.opened_connections;
  expect(databaseOpenedConnections).toBeDefined();
  expect(databaseOpenedConnections).toEqual(1);
  expect(typeof databaseOpenedConnections).toBe("number");
});
