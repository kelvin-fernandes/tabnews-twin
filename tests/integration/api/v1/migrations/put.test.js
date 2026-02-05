import orchestrator from "tests/orchestrator";

let response;
let responseData;

beforeAll(async () => {
  await orchestrator.clearDatabase();
  response = await fetch("http://localhost:3000/api/v1/migrations", {
    method: "PUT",
  });
  responseData = await response.json();
});

describe("PUT /api/v1/migrations", () => {
  describe("anonymous user", () => {
    describe("when trying to PUT a migration", () => {
      test("should return 405", async () => {
        expect(response.status).toBe(405);
      });

      test("should return method not allowed error body", async () => {
        expect(responseData).toEqual({
          name: "MethodNotAllowed",
          message: "Method not allowed for this endpoint.",
          action: "Call a valid endpoint with a supported HTTP method.",
          status_code: 405,
        });
      });
    });
  });
});
