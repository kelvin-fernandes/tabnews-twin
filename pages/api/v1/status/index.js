import database from '../../../../infra/database.js'

async function status(request, response) {
  const dbResult = await database.query("SELECT \'OK\' AS message;");
  console.log('Database response:', dbResult);
  response.status(200).json({ status: 'OK' });
}

export default status;