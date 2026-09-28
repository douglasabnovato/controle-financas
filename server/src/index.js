/* Ponto de entrada: valida configuração, migra o banco e sobe a API */
require("dotenv").config();
const { Pool } = require("pg");
const { GoogleGenAI } = require("@google/genai");
const { loadConfig, missing } = require("./config");
const { migrate } = require("./db/migrate");
const { createRepositories } = require("./repositories");
const { createGeminiExtractor } = require("./services/receiptExtractor");
const { createApp } = require("./app");

/* Inicializa dependências e escuta na porta configurada */
async function main() {
  const config = loadConfig();
  const absent = missing(config);
  if (absent.length) {
    console.error(`Configuração incompleta: ${absent.join(", ")}. Veja server/.env.example.`);
    process.exit(1);
  }
  const pool = new Pool({ connectionString: config.databaseUrl, ssl: config.databaseSsl ? { rejectUnauthorized: false } : undefined, max: 5 });
  await migrate(pool);
  const extractor = createGeminiExtractor({ client: new GoogleGenAI({}), model: config.geminiModel });
  createApp({ repos: createRepositories(pool), extractor, config }).listen(config.port, () =>
    console.log(`API controle-financas na porta ${config.port}`)
  );
}

main().catch((err) => {
  console.error("Falha ao iniciar:", err.message);
  process.exit(1);
});
/* Fim de index.js */
