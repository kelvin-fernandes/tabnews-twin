import database from "infra/database.js";

let response;
let responseData;

beforeAll(async () => {
  await database.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
  response = await fetch("http://localhost:3000/api/v1/migrations");
  responseData = await response.json();
});

test("GET /api/v1/migrations should return 200", async () => {
  expect(response.status).toBe(200);
});

test("GET /api/v1/migrations should return array", async () => {
  expect(Array.isArray(responseData)).toBe(true);
});

test("GET /api/v1/migrations should return array not empty", async () => {
  expect(responseData.length).toBeGreaterThan(0);
});
