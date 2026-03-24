import orchestrator from "tests/orchestrator";

let postResponse;
let getResponse1;
let getResponse1Data;
let getResponse2;
let getResponse2Data;
let response404;
let response404Data;

async function sendGetRequest(username) {
  return await fetch(`http://localhost:3000/api/v1/users/${username}`);
}

beforeAll(async () => {
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
  postResponse = await orchestrator.createUser();

  response404 = await sendGetRequest("unexisting_user");
  response404Data = await response404.json();
});

describe("GET /api/v1/users/[username]", () => {
  describe("anonymous user", () => {
    describe("with exact case match", () => {
      test("should return 200", async () => {
        getResponse1 = await sendGetRequest(postResponse.username);
        getResponse1Data = await getResponse1.json();

        expect(getResponse1.status).toBe(200);
      });

      test("should return the expected user data", async () => {
        expect(getResponse1Data).toEqual({
          id: expect.any(String),
          username: postResponse.username,
          email: postResponse.email,
          password: getResponse1Data.password,
          created_at: getResponse1Data.created_at,
          updated_at: getResponse1Data.updated_at,
        });
      });
    });

    describe("with case mismatch", () => {
      test("should return 200", async () => {
        getResponse2 = await sendGetRequest(
          postResponse.username.toUpperCase(),
        );
        getResponse2Data = await getResponse2.json();
        expect(getResponse2.status).toBe(200);
      });

      test("should return the expected user data", async () => {
        expect(getResponse2Data).toEqual({
          id: expect.any(String),
          username: postResponse.username,
          email: postResponse.email,
          password: getResponse2Data.password,
          created_at: getResponse2Data.created_at,
          updated_at: getResponse2Data.updated_at,
        });
      });
    });

    describe("with unexisting username", () => {
      test("should return 404", async () => {
        expect(response404.status).toBe(404);
      });

      test("should return the expected error response data", async () => {
        expect(response404Data).toEqual({
          name: "NotFoundError",
          message: "User not found",
          action: "Check if the username is correct.",
          status_code: 404,
        });
      });
    });
  });
});
