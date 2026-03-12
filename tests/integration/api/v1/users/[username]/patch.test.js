import orchestrator from "tests/orchestrator";
import user from "models/user.js";
import password from "models/password.js";

let patchResponse;
let patchResponseData;
let response404;
let response404Data;
let userFromDatabase;
const patchInputBody = {
  email: "patch_kovit@gmail.com",
};

async function sendPostRequest(inputBody) {
  return await fetch("http://localhost:3000/api/v1/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(inputBody),
  });
}

async function sendPatchRequest(username, body) {
  return await fetch(`http://localhost:3000/api/v1/users/${username}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

beforeAll(async () => {
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();

  response404 = await sendPatchRequest("unexisting_patch_user", patchInputBody);
  response404Data = await response404.json();
});

describe("PATCH /api/v1/users/[username]", () => {
  describe("anonymous user", () => {
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

    describe("with duplicated username", () => {
      test("should return 400", async () => {
        await sendPostRequest({
          username: "user1",
          email: "username1@email.com",
          password: "random_pass1",
        });

        await sendPostRequest({
          username: "user2",
          email: "username2@email.com",
          password: "random_pass2",
        });

        patchResponse = await sendPatchRequest("user2", {
          username: "user1",
        });

        expect(patchResponse.status).toBe(400);
      });

      test("should return the expected error response data", async () => {
        patchResponseData = await patchResponse.json();
        expect(patchResponseData).toEqual({
          name: "ValidationError",
          message: "Username already exists",
          action: "Use a different username.",
          status_code: 400,
        });
      });
    });

    describe("with duplicated email", () => {
      test("should return 400", async () => {
        await sendPostRequest({
          username: "user_with_duplicated_email1",
          email: "user_with_duplicated_email1@email.com",
          password: "random_pass1",
        });

        await sendPostRequest({
          username: "user_with_duplicated_email2",
          email: "user_with_duplicated_email2@email.com",
          password: "random_pass2",
        });

        patchResponse = await sendPatchRequest("user_with_duplicated_email2", {
          email: "user_with_duplicated_email1@email.com",
        });

        expect(patchResponse.status).toBe(400);
      });

      test("should return the expected error response data", async () => {
        const patchResponseData = await patchResponse.json();
        expect(patchResponseData).toEqual({
          name: "ValidationError",
          message: "Email already exists",
          action: "Use a different email address.",
          status_code: 400,
        });
      });
    });

    describe("with unique username", () => {
      test("should return 200", async () => {
        await sendPostRequest({
          username: "unique_user1",
          email: "unique_user1@email.com",
          password: "random_pass1",
        });

        patchResponse = await sendPatchRequest("unique_user1", {
          username: "unique_user2",
        });

        expect(patchResponse.status).toBe(200);
      });

      test("should return the expected success response data", async () => {
        patchResponseData = await patchResponse.json();
        expect(patchResponseData).toEqual({
          id: patchResponseData.id,
          username: "unique_user2",
          email: patchResponseData.email,
          password: patchResponseData.password,
          created_at: patchResponseData.created_at,
          updated_at: patchResponseData.updated_at,
        });
      });

      test("should return updated_at greater than created_at", async () => {
        const createdAt = new Date(patchResponseData.created_at);
        const updatedAt = new Date(patchResponseData.updated_at);

        expect(updatedAt > createdAt).toBe(true);
      });
    });

    describe("with unique email", () => {
      test("should return 200", async () => {
        await sendPostRequest({
          username: "unique_email1",
          email: "unique_email1@email.com",
          password: "random_pass1",
        });

        patchResponse = await sendPatchRequest("unique_email1", {
          email: "unique_email2@email.com",
        });

        expect(patchResponse.status).toBe(200);
      });

      test("should return the expected success response data", async () => {
        patchResponseData = await patchResponse.json();
        expect(patchResponseData).toEqual({
          id: patchResponseData.id,
          username: patchResponseData.username,
          email: "unique_email2@email.com",
          password: patchResponseData.password,
          created_at: patchResponseData.created_at,
          updated_at: patchResponseData.updated_at,
        });
      });

      test("should return updated_at greater than created_at", async () => {
        const createdAt = new Date(patchResponseData.created_at);
        const updatedAt = new Date(patchResponseData.updated_at);

        expect(updatedAt > createdAt).toBe(true);
      });
    });

    describe("with new password", () => {
      test("should return 200", async () => {
        // const postResponse =
        await sendPostRequest({
          username: "new_password1",
          email: "new_password1@email.com",
          password: "very_unique_password",
        });
        // const postResponseData = await postResponse.json();

        patchResponse = await sendPatchRequest("new_password1", {
          password: "the_most_unique_password",
        });

        expect(patchResponse.status).toBe(200);
      });

      test("should return the expected success response data", async () => {
        patchResponseData = await patchResponse.json();
        expect(patchResponseData).toEqual({
          id: patchResponseData.id,
          username: "new_password1",
          email: "new_password1@email.com",
          password: patchResponseData.password,
          created_at: patchResponseData.created_at,
          updated_at: patchResponseData.updated_at,
        });
      });

      test("should return updated_at greater than created_at", async () => {
        const createdAt = new Date(patchResponseData.created_at);
        const updatedAt = new Date(patchResponseData.updated_at);

        expect(updatedAt > createdAt).toBe(true);
      });

      test("should return 'true' from password comparison", async () => {
        userFromDatabase = await user.findOneByUsername("new_password1");
        const isPasswordValid = await password.compare(
          "the_most_unique_password",
          userFromDatabase.password,
        );
        expect(isPasswordValid).toBe(true);
      });

      test("should return 'false' from old password comparison", async () => {
        userFromDatabase = await user.findOneByUsername("new_password1");
        const isPasswordValid = await password.compare(
          "very_unique_password",
          userFromDatabase.password,
        );
        expect(isPasswordValid).toBe(false);
      });
    });
  });
});
