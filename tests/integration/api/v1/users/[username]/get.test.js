import orchestrator from "tests/orchestrator";

let getResponse1;
let getResponse1Data;
let getResponse2;
let getResponse2Data;
let response404;
let response404Data;

async function sendPostRequest(inputBody) {
  return await fetch("http://localhost:3000/api/v1/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(inputBody),
  });
}

async function sendGetRequest(username) {
  return await fetch(`http://localhost:3000/api/v1/users/${username}`);
}

beforeAll(async () => {
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();

  await sendPostRequest({
    username: "KF1",
    email: "kf@pm.me",
    password: "pass",
  });

  getResponse1 = await sendGetRequest("KF1");
  getResponse1Data = await getResponse1.json();

  getResponse2 = await sendGetRequest("kf1");
  getResponse2Data = await getResponse2.json();

  response404 = await sendGetRequest("unexisting_user");
  response404Data = await response404.json();
});

describe("GET /api/v1/users/[username]", () => {
  describe("anonymous user", () => {
    describe("with exact case match", () => {
      test("should return 200", async () => {
        expect(getResponse1.status).toBe(200);
      });

      test("should return the expected user data", async () => {
        expect(getResponse1Data).toEqual({
          id: expect.any(String),
          username: "KF1",
          email: "kf@pm.me",
        });
      });
    });

    describe("with case mismatch", () => {
      test("should return 200", async () => {
        expect(getResponse2.status).toBe(200);
      });

      test("should return the expected user data", async () => {
        expect(getResponse2Data).toEqual({
          id: expect.any(String),
          username: "KF1",
          email: "kf@pm.me",
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
