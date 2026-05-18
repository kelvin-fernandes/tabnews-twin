import setCookieParser from "set-cookie-parser";
import orchestrator from "tests/orchestrator";
import session from "models/session.js";
import { version as uuidVersion } from "uuid";

let response;
let response1;
let response2;
let response3;
let user;
let responseData;
// let userFromDatabase;
const userInputBody = {
  email: "postkf@pm.me",
  password: "pass",
};

async function sendPostRequest(inputBody) {
  response = await fetch("http://localhost:3000/api/v1/sessions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(inputBody),
  });
  return response;
}

beforeAll(async () => {
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
  user = await orchestrator.createUser(userInputBody);
  response = await sendPostRequest(userInputBody);
  responseData = await response.json();
  // userFromDatabase = await user.findOneByEmail(userInputBody.email);
});

describe("POST /api/v1/sessions", () => {
  describe("anonymous user", () => {
    describe("with correct email and correct password", () => {
      test("should return 201", async () => {
        expect(response.status).toBe(201);
      });

      test("should return the expected response data", async () => {
        expect(responseData).toEqual({
          id: responseData.id,
          user_id: user.id,
          expires_at: responseData.expires_at,
          token: responseData.token,
          created_at: responseData.created_at,
          updated_at: responseData.updated_at,
        });

        expect(uuidVersion(responseData.id)).toBe(4);
        expect(Date.parse(responseData.expires_at)).not.toBeNaN();
        expect(Date.parse(responseData.created_at)).not.toBeNaN();
        expect(Date.parse(responseData.updated_at)).not.toBeNaN();
        expect(Date.parse(responseData.expires_at)).toBeGreaterThan(
          Date.parse(responseData.created_at),
        );
        expect(typeof responseData.token).toBe("string");
        expect(responseData.token.length).toBe(96);

        const expiresAt = new Date(responseData.expires_at);
        expiresAt.setMilliseconds(0);
        const createdAt = new Date(responseData.created_at);
        createdAt.setMilliseconds(0);
        const timeDifference = expiresAt.getTime() - createdAt.getTime();
        expect(timeDifference).toBe(session.EXPIRATION_IN_MILISECONDS);
      });

      test("should return a valid Set-Cookie header with the session_id", async () => {
        const cookie = setCookieParser.parse(
          response.headers.get("Set-Cookie"),
          { map: true },
        );
        expect(cookie.session_id).toBeDefined();
        expect(cookie.session_id).toEqual({
          name: "session_id",
          value: responseData.token,
          path: "/",
          maxAge: session.EXPIRATION_IN_MILISECONDS / 1000,
          sameSite: "Strict",
          httpOnly: true,
        });
      });
    });

    describe("with incorrect email and correct password", () => {
      test("should return 401", async () => {
        response1 = await sendPostRequest({
          email: "incorrect_email@email.com",
          password: userInputBody.password,
        });

        expect(response1.status).toBe(401);
      });

      test("should return Set-Cookie header without session_id", async () => {
        const cookie = setCookieParser.parse(
          response1.headers.get("Set-Cookie"),
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

      test("should return the expected error response data", async () => {
        const response1Data = await response1.json();
        expect(response1Data).toEqual({
          name: "UnauthorizedError",
          message: "Invalid email or password",
          action: "Please check your credentials and try again",
          status_code: 401,
        });
      });
    });

    describe("with correct email and incorrect password", () => {
      test("should return 401", async () => {
        response2 = await sendPostRequest({
          email: userInputBody.email,
          password: "incorrect_password",
        });

        expect(response2.status).toBe(401);
      });

      test("should return Set-Cookie header without session_id", async () => {
        const cookie = setCookieParser.parse(
          response2.headers.get("Set-Cookie"),
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

      test("should return the expected error response data", async () => {
        const response2Data = await response2.json();
        expect(response2Data).toEqual({
          name: "UnauthorizedError",
          message: "Invalid email or password",
          action: "Please check your credentials and try again",
          status_code: 401,
        });
      });
    });

    describe("with incorrect email and incorrect password", () => {
      test("should return 401", async () => {
        response3 = await sendPostRequest({
          email: "incorrect_email@email.com",
          password: "incorrect_password",
        });

        expect(response3.status).toBe(401);
      });

      test("should return Set-Cookie header without session_id", async () => {
        const cookie = setCookieParser.parse(
          response3.headers.get("Set-Cookie"),
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

      test("should return the expected error response data", async () => {
        const response3Data = await response3.json();
        expect(response3Data).toEqual({
          name: "UnauthorizedError",
          message: "Invalid email or password",
          action: "Please check your credentials and try again",
          status_code: 401,
        });
      });
    });
  });
});
