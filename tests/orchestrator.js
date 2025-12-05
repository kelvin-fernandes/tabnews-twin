import retry from "async-retry"

async function waitForAllServices() {
  await waitForWebServer()

  async function waitForWebServer() {
    await retry(async () => {
      await fetch("http://localhost:3000/api/v1/status")
    }, {
      retries: 50,
    })
  }
}

export default {
  waitForAllServices,
}