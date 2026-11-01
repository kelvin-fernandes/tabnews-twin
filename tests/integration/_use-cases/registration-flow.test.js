import orchestrator from "tests/orchestrator";
import webserver from "infra/webserver.js";

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

describe("Use case: Registration flow (happy path)", () => {
  let user;
  test("should register a new user", async () => {
    const response = await registerUser();

    expect(response.status).toBe(201);

    user = await response.json();

    expect(user).toEqual({
      id: user.id,
      username: "registration-flow-user",
      email: "registration.flow.user@example.com",
      password: user.password,
      features: ["read:activation_token"],
      created_at: user.created_at,
      updated_at: user.updated_at,
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

    const tokenFromLastEmail = orchestrator.extractTokenFromEmail(
      lastEmail.text,
    );

    expect(lastEmail.text).toContain(
      `${webserver.getOrigin()}/register/activate?token=${tokenFromLastEmail}`,
    );

    const activationToken =
      await orchestrator.findValidActivationToken(tokenFromLastEmail);

    expect(activationToken).toBeDefined();
    expect(activationToken.user_id).toBe(user.id);
    expect(activationToken.used_at).toBeNull();
  });

  test("should activate the user account", async () => {});

  test("should user log in", async () => {});

  test("should user get account info", async () => {});
});
