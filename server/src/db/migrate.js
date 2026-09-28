/* Aplica o schema.sql idempotente numa transação */
const fs = require("fs");
const path = require("path");

/* Executa o DDL completo */
async function migrate(pool) {
  const sql = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(sql);
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { migrate };
/* Fim de migrate.js */
