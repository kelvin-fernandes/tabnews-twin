let response;
let responseData;

beforeAll(async () => {
  response = await fetch("http://localhost:3000/api/v1/status", { method: "POST" });
  responseData = await response.json();
});

describe("POST /api/v1/status", () => {
  describe("anonymous user", () => {
    describe("when sending a POST request", () => {
      test("should return 405", async () => {
        expect(response.status).toBe(405);
      });

      test("should return method not allowed error body", async () => {
        expect(responseData).toEqual({
          name: "MethodNotAllowed",
          message: "Method not allowed for this endpoint.",
          action: "Call a valid endpoint with a supported HTTP method.",
          status_code: 405
        });
      });
    });
  });
});
