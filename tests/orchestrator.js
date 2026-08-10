import retry from "async-retry";
import { faker } from "@faker-js/faker";
import database from "infra/database.js";
import migrator from "models/migrator.js";
import user from "models/user.js";
import session from "models/session.js";

const EMAIL_HTTP_URL = `http://${process.env.EMAIL_SMTP_HOST}:${process.env.EMAIL_HTTP_PORT}`;

async function waitForAllServices() {
  await waitForWebServer();
  await waitForEmailServer();

  async function waitForWebServer() {
    await retry(
      async () => {
        const response = await fetch("http://localhost:3000/api/v1/status");

        if (!response.ok) {
          throw new Error("Web server not ready");
        }
      },
      {
        retries: 50,
        maxTimeout: 1000,
      },
    );
  }

  async function waitForEmailServer() {
    await retry(
      async () => {
        const response = await fetch(`${EMAIL_HTTP_URL}/messages`);

        if (!response.ok) {
          throw new Error("Email server not ready");
        }
      },
      {
        retries: 50,
        maxTimeout: 1000,
      },
    );
  }
}

async function clearDatabase() {
  await database.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
}

async function runPendingMigrations() {
  await migrator.runPendingMigrations();
}

async function createUser(userObject) {
  return await user.create({
    username:
      userObject?.username || faker.internet.username().replace(/[_.-]/g, ""),
    email: userObject?.email || faker.internet.email(),
    password: userObject?.password || faker.internet.password(),
  });
}

async function createSession(userId) {
  return await session.create(userId);
}

async function clearEmailBox() {
  await fetch(`${EMAIL_HTTP_URL}/messages`, {
    method: "DELETE",
  });
}

async function getLastEmail() {
  const emailsResponse = await fetch(`${EMAIL_HTTP_URL}/messages`);
  const emails = await emailsResponse.json();

  const lastEmailResponse = emails.pop();

  const lastEmailTextResponse = await fetch(
    `${EMAIL_HTTP_URL}/messages/${lastEmailResponse.id}.plain`,
  );

  lastEmailResponse.text = await lastEmailTextResponse.text();

  return lastEmailResponse;
}

const orchestrator = {
  waitForAllServices,
  clearDatabase,
  runPendingMigrations,
  createUser,
  createSession,
  clearEmailBox,
  getLastEmail,
};

export default orchestrator;
