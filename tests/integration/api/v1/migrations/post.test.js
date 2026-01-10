import database from "infra/database.js";

let response;
let responseData;
let migrationsResponse;

async function migrationsCount() {
  return await database.query("SELECT COUNT(*)::int FROM public.pgmigrations;");
}

beforeAll(async () => {
  await database.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
  response = await fetch("http://localhost:3000/api/v1/migrations", {
    method: "POST",
  });
  responseData = await response.json();
  migrationsResponse = await migrationsCount();
});

describe("POST /api/v1/migrations", () => {
  describe("anonymous user", () => {
    describe("running pending migrations", () => {
      test("should return 201", async () => {
        expect(response.status).toBe(201);
      });

      test("should return array", async () => {
        expect(Array.isArray(responseData)).toBe(true);
      });

      test("should return array not empty", async () => {
        expect(responseData.length).toBeGreaterThan(0);
      });

      test("should return array with length equals to number of migrations", async () => {
        expect(responseData.length).toBe(migrationsResponse.rows[0].count);
      });

      test("should return empty array when run again", async () => {
        response = await fetch("http://localhost:3000/api/v1/migrations", {
          method: "POST",
        });
        responseData = await response.json();
        expect(responseData.length).toBe(0);
      });
    });
  });
});
