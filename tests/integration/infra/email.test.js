import email from "infra/email.js";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearEmailBox();
});

describe("infra/email.js", () => {
  describe("send", () => {
    test("should send an email", async () => {
      await email.send({
        from: "Deploya <contato@deploya.dev.br>",
        to: "sokelvinfernandes@gmail.com",
        subject: "Test email",
        text: "This is a test email.",
      });

      const lastEmail = await orchestrator.getLastEmail();

      expect(lastEmail).toBeDefined();
      expect(lastEmail.subject).toBe("Test email");
      expect(lastEmail.recipients[0]).toBe("<sokelvinfernandes@gmail.com>");
      expect(lastEmail.sender).toBe("<contato@deploya.dev.br>");
      expect(lastEmail.text).toBe("This is a test email.\n");
    });
  });
});
