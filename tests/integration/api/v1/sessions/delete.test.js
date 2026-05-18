import setCookieParser from "set-cookie-parser";
import orchestrator from "tests/orchestrator.js";
import session from "models/session.js";

let userWithValidSession;
let userWithExpiredSession;
let createdSession;
let deleteResponseValidSession;
let deleteResponseExpiredSession;
let deleteResponseExpiredSessionData;
let deleteResponseNonExistingSession;
let deleteResponseNonExistingSessionData;

async function sendDeleteRequest(token) {
  return await fetch(`http://localhost:3000/api/v1/sessions`, {
    method: "DELETE",
    headers: {
      Cookie: `session_id=${token || createdSession.token}`,
    },
  });
}

async function sendGetUserRequest(token) {
  return await fetch(`http://localhost:3000/api/v1/user`, {
    method: "GET",
    headers: {
      Cookie: `session_id=${token || createdSession.token}`,
    },
  });
}

beforeAll(async () => {
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("DELETE /api/v1/sessions", () => {
  describe("default user", () => {
    describe("with valid session", () => {
      test("should return 204", async () => {
        userWithValidSession = await orchestrator.createUser({
          username: "user_with_valid_session",
        });

        createdSession = await orchestrator.createSession(
          userWithValidSession.id,
        );

        deleteResponseValidSession = await sendDeleteRequest(
          createdSession.token,
        );

        expect(deleteResponseValidSession.status).toBe(204);
      });

      test("should session no longer be valid", async () => {
        const getUserWithInvalidatedSession = await sendGetUserRequest();
        const getUserWithInvalidatedSessionData =
          await getUserWithInvalidatedSession.json();

        expect(getUserWithInvalidatedSession.status).toBe(401);
        expect(getUserWithInvalidatedSessionData).toEqual({
          name: "UnauthorizedError",
          message: "Invalid session token",
          action: "Check if the session token is correct.",
          status_code: 401,
        });
      });

      test("should return Set-Cookie header invalidating the session cookie", async () => {
        const cookie = setCookieParser.parse(
          deleteResponseValidSession.headers.get("Set-Cookie"),
          { map: true },
        );
        expect(cookie.session_id).toBeDefined();
        expect(cookie.session_id).toEqual({
          name: "session_id",
          value: "invalid",
          path: "/",
          maxAge: -1,
          sameSite: "Strict",
          httpOnly: true,
        });
      });
    });

    describe("with non-existing session", () => {
      test("should return 401", async () => {
        deleteResponseNonExistingSession = await sendDeleteRequest(
          "invalid_session_token",
        );

        deleteResponseNonExistingSessionData =
          await deleteResponseNonExistingSession.json();
        expect(deleteResponseNonExistingSession.status).toBe(401);
      });

      test("should return the expected error response data", async () => {
        expect(deleteResponseNonExistingSessionData).toEqual({
          name: "UnauthorizedError",
          message: "Invalid session token",
          action: "Check if the session token is correct.",
          status_code: 401,
        });
      });
    });

    describe("with expired session", () => {
      test("should return 401", async () => {
        jest.useFakeTimers({
          now: new Date(Date.now() - session.EXPIRATION_IN_MILISECONDS),
        });

        userWithExpiredSession = await orchestrator.createUser({
          username: "user_with_expired_session",
        });

        createdSession = await orchestrator.createSession(
          userWithExpiredSession.id,
        );

        jest.useRealTimers();

        deleteResponseExpiredSession = await sendDeleteRequest();
        deleteResponseExpiredSessionData =
          await deleteResponseExpiredSession.json();

        expect(deleteResponseExpiredSession.status).toBe(401);
      });

      test("should return the expected error response data", async () => {
        expect(deleteResponseExpiredSessionData).toEqual({
          name: "UnauthorizedError",
          message: "Invalid session token",
          action: "Check if the session token is correct.",
          status_code: 401,
        });
      });
    });
  });
});
