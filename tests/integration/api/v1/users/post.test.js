import orchestrator from "tests/orchestrator";
import user from "models/user.js";
import password from "models/password.js";
import { version as uuidVersion } from "uuid";

let response;
let response1;
let response2;
let responseData;
let userFromDatabase;
const userInputBody = {
  username: "postkf1",
  email: "postkf@pm.me",
  password: "pass",
};

async function sendPostRequest(inputBody) {
  response = await fetch("http://localhost:3000/api/v1/users", {
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
  response = await sendPostRequest(userInputBody);
  responseData = await response.json();
  userFromDatabase = await user.findOneByUsername(userInputBody.username);
});

describe("POST /api/v1/users", () => {
  describe("anonymous user", () => {
    describe("with unique and valid data", () => {
      test("should return 201", async () => {
        expect(response.status).toBe(201);
      });

      test("should return the expected response data", async () => {
        expect(responseData).toEqual({
          id: responseData.id,
          username: userInputBody.username,
          email: userInputBody.email,
          password: responseData.password,
          created_at: responseData.created_at,
          updated_at: responseData.updated_at,
        });
      });

      test("should return a valid UUID v4 as id", async () => {
        expect(uuidVersion(responseData.id)).toBe(4);
      });

      test("should return a valid created_at and updated_at dates", async () => {
        expect(Date.parse(responseData.created_at)).not.toBeNaN();
        expect(Date.parse(responseData.updated_at)).not.toBeNaN();
      });

      test("should return a valid password hash", async () => {
        const isPasswordValid = await password.compare(
          userInputBody.password,
          userFromDatabase.password,
        );
        expect(isPasswordValid).toBe(true);
      });
    });

    describe("with duplicated email", () => {
      test("should return 400", async () => {
        response1 = await sendPostRequest({
          username: "dup email1",
          email: "dup_email@email.com",
          password: "dup_email123",
        });

        expect(response1.status).toBe(201);

        response2 = await sendPostRequest({
          username: "dup email2",
          email: "dup_email@email.com",
          password: "dup_email234",
        });

        expect(response2.status).toBe(400);
      });

      test("should return the expected error response data", async () => {
        const response2Data = await response2.json();
        expect(response2Data).toEqual({
          name: "ValidationError",
          message: "Email already exists",
          action: "Use a different email address.",
          status_code: 400,
        });
      });
    });

    describe("with duplicated username", () => {
      test("should return 400", async () => {
        response1 = await sendPostRequest({
          username: "dup username1",
          email: "username1@email.com",
          password: "dup_email123",
        });

        expect(response1.status).toBe(201);

        response2 = await sendPostRequest({
          username: "dup username1",
          email: "username2@email.com",
          password: "dup_email234",
        });

        expect(response2.status).toBe(400);
      });

      test("should return the expected error response data", async () => {
        const response2Data = await response2.json();
        expect(response2Data).toEqual({
          name: "ValidationError",
          message: "Username already exists",
          action: "Use a different username.",
          status_code: 400,
        });
      });
    });

    describe("with invalid password", () => {
      test("should return 'false' from password compare", async () => {
        const isPasswordValid = await password.compare(
          "invalidpassword",
          userFromDatabase.password,
        );
        expect(isPasswordValid).toBe(false);
      });
    });
  });
});
