import database from '/infra/database.js'

async function status(request, response) {
  const dbResult = await database.query("SELECT \'OK\' AS message;");
  response.status(200).json({ status: dbResult });
}

export default status;