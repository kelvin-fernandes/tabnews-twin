// import password from "models/password.js";
import setCookieParser from "set-cookie-parser";
import orchestrator from "tests/orchestrator.js";
import session from "models/session.js";

let userWithValidSession;
let userWithExpiredSession;
let userWithNearToExpireSession;
let createdSession;
let renewedSession;
let nearToExpireSession;
let getResponseValidSession;
let getResponseValidSessionData;
let getResponseExpiredSession;
let getResponseExpiredSessionData;
let getResponseNonExistingSession;
let getResponseNonExistingSessionData;
let getResponseNearToExpireSession;
let getResponseNearToExpireSessionData;

async function sendGetRequest(token) {
  return await fetch(`http://localhost:3000/api/v1/user`, {
    headers: {
      Cookie: `session_id=${token || createdSession.token}`,
    },
  });
}

beforeAll(async () => {
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/user", () => {
  describe("default user", () => {
    describe("with valid session", () => {
      test("should return 200", async () => {
        userWithValidSession = await orchestrator.createUser({
          username: "user_with_valid_session",
        });

        createdSession = await orchestrator.createSession(
          userWithValidSession.id,
        );

        getResponseValidSession = await sendGetRequest();
        getResponseValidSessionData = await getResponseValidSession.json();

        expect(getResponseValidSession.status).toBe(200);
      });

      test("should return the expected user data", async () => {
        expect(getResponseValidSessionData).toEqual({
          id: userWithValidSession.id,
          username: userWithValidSession.username,
          email: userWithValidSession.email,
          password: userWithValidSession.password,
          created_at: userWithValidSession.created_at.toISOString(),
          updated_at: userWithValidSession.updated_at.toISOString(),
        });
      });

      test("should renew the session expiration date", async () => {
        renewedSession = await session.findValidSessionToken(
          createdSession.token,
        );

        expect(
          renewedSession.expires_at > createdSession.expires_at,
        ).toBeTruthy();
        expect(
          renewedSession.updated_at > createdSession.updated_at,
        ).toBeTruthy();
      });

      test("should return a Set-Cookie header with the renewed session token", async () => {
        const cookie = setCookieParser.parse(
          getResponseValidSession.headers.get("Set-Cookie"),
          { map: true },
        );
        expect(cookie.session_id).toBeDefined();
        expect(cookie.session_id).toEqual({
          name: "session_id",
          value: renewedSession.token,
          path: "/",
          maxAge: session.EXPIRATION_IN_MILISECONDS / 1000,
          sameSite: "Strict",
          httpOnly: true,
        });
      });
    });

    describe("with non-existing session", () => {
      test("should return 401", async () => {
        getResponseNonExistingSession = await sendGetRequest(
          "invalid_session_token",
        );

        getResponseNonExistingSessionData =
          await getResponseNonExistingSession.json();
        expect(getResponseNonExistingSession.status).toBe(401);
      });

      test("should return the expected error response data", async () => {
        expect(getResponseNonExistingSessionData).toEqual({
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

        getResponseExpiredSession = await sendGetRequest();
        getResponseExpiredSessionData = await getResponseExpiredSession.json();

        expect(getResponseExpiredSession.status).toBe(401);
      });

      test("should return the expected error response data", async () => {
        expect(getResponseExpiredSessionData).toEqual({
          name: "UnauthorizedError",
          message: "Invalid session token",
          action: "Check if the session token is correct.",
          status_code: 401,
        });
      });
    });

    describe("with valid session with 10s to expire", () => {
      test("should return 200", async () => {
        jest.useFakeTimers({
          now: new Date(Date.now() - session.EXPIRATION_IN_MILISECONDS + 10000),
        });

        userWithNearToExpireSession = await orchestrator.createUser({
          username: "user_with_10s_to_exp_session",
        });

        nearToExpireSession = await orchestrator.createSession(
          userWithNearToExpireSession.id,
        );

        jest.useRealTimers();

        getResponseNearToExpireSession = await sendGetRequest(
          nearToExpireSession.token,
        );
        getResponseNearToExpireSessionData =
          await getResponseNearToExpireSession.json();

        expect(getResponseNearToExpireSession.status).toBe(200);
      });

      test("should return the expected user data", async () => {
        expect(getResponseNearToExpireSessionData).toEqual({
          id: userWithNearToExpireSession.id,
          username: userWithNearToExpireSession.username,
          email: userWithNearToExpireSession.email,
          password: userWithNearToExpireSession.password,
          created_at: userWithNearToExpireSession.created_at.toISOString(),
          updated_at: userWithNearToExpireSession.updated_at.toISOString(),
        });
      });

      test("should renew the session expiration date", async () => {
        const renewedNearToExpireSession = await session.findValidSessionToken(
          nearToExpireSession.token,
        );

        expect(
          renewedNearToExpireSession.expires_at >
            nearToExpireSession.expires_at,
        ).toBeTruthy();
        expect(
          renewedNearToExpireSession.updated_at >
            nearToExpireSession.updated_at,
        ).toBeTruthy();
      });

      test("should return a Set-Cookie header with the renewed session token", async () => {
        const cookie = setCookieParser.parse(
          getResponseNearToExpireSession.headers.get("Set-Cookie"),
          { map: true },
        );
        expect(cookie.session_id).toBeDefined();
        expect(cookie.session_id).toEqual({
          name: "session_id",
          value: nearToExpireSession.token,
          path: "/",
          maxAge: session.EXPIRATION_IN_MILISECONDS / 1000,
          sameSite: "Strict",
          httpOnly: true,
        });
      });
    });
  });
});
