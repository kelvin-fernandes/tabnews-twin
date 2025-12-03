const { exec } = require("node:child_process")

function isPostgresReady() {
  exec("docker exec postgres-twin-dev pg_isready --host localhost", handleReturn);

  function handleReturn(error, stdout, stderr) {
    if (error) {
      process.stdout.write(".");
      setTimeout(isPostgresReady, 100);
      return;
    }

    if (stdout.includes("accepting connections")) {
      console.log("\n🟢 Postgres is ready!");
      return;
    }
  }
}

process.stdout.write("\n🔴 Waiting for Postgres to be ready");
isPostgresReady();

