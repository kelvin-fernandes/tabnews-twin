import database from "infra/database.js";

let response;
let responseData;

beforeAll(async () => {
  await database.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
  response = await fetch("http://localhost:3000/api/v1/migrations");
  responseData = await response.json();
});

describe("GET /api/v1/migrations", () => {
  describe("anonymous user", () => {
    describe("retrieving pending migrations", () => {

      test("should return 200", async () => {
        expect(response.status).toBe(200);
      });

      test("should return array", async () => {
        expect(Array.isArray(responseData)).toBe(true);
      });

      test("should return array not empty", async () => {
        expect(responseData.length).toBeGreaterThan(0);
      });
    });
  });
});