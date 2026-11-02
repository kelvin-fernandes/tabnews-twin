import orchestrator from "tests/orchestrator";
import webserver from "infra/webserver.js";
import user from "models/user.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
  await orchestrator.clearEmailBox();
});

async function registerUser() {
  return await fetch("http://localhost:3000/api/v1/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: "registration-flow-user",
      email: "registration.flow.user@example.com",
      password: "registration-flow-password",
    }),
  });
}

async function activateUser(tokenId) {
  return await fetch(`http://localhost:3000/api/v1/activations/${tokenId}`, {
    method: "PATCH",
  });
}

describe("Use case: Registration flow (happy path)", () => {
  let userCreated;
  let tokenIdFromEmail;

  test("should register a new user", async () => {
    const response = await registerUser();

    expect(response.status).toBe(201);

    userCreated = await response.json();

    expect(userCreated).toEqual({
      id: userCreated.id,
      username: "registration-flow-user",
      email: "registration.flow.user@example.com",
      password: userCreated.password,
      features: ["read:activation_token"],
      created_at: userCreated.created_at,
      updated_at: userCreated.updated_at,
    });
  });

  test("should get a confirmation email", async () => {
    const lastEmail = await orchestrator.getLastEmail();

    expect(lastEmail.sender).toBe("<kelvin@deploya.dev.br>");
    expect(lastEmail.recipients[0]).toBe(
      "<registration.flow.user@example.com>",
    );
    expect(lastEmail.subject).toBe("Activate your account at Deploya");
    expect(lastEmail.text).toContain("registration-flow-user");

    tokenIdFromEmail = orchestrator.extractTokenIdFromEmail(lastEmail.text);

    expect(lastEmail.text).toContain(
      `${webserver.getOrigin()}/register/activate?token=${tokenIdFromEmail}`,
    );

    const activationToken =
      await orchestrator.findValidActivationToken(tokenIdFromEmail);

    expect(activationToken).toBeDefined();
    expect(activationToken.user_id).toBe(userCreated.id);
    expect(activationToken.used_at).toBeNull();
  });

  test("should activate the user account", async () => {
    const response = await activateUser(tokenIdFromEmail);

    expect(response.status).toBe(200);

    const responseBody = await response.json();

    expect(Date.parse(responseBody.used_at)).not.toBeNaN();

    const userActivationToken = await user.findOneByUsername(
      userCreated.username,
    );

    expect(userActivationToken.features).toEqual(["create:session"]);
  });

  // test("should user log in", async () => {});

  // test("should user get account info", async () => {});
});
