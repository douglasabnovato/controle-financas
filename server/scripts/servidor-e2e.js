/* API para o teste de ponta a ponta no navegador: PostgreSQL real (E2E_DATABASE_URL) e leitura da IA simulada,
   sem chamar o Gemini. Não é usada em produção. */
const { Pool } = require("pg");
const { migrate } = require("../src/db/migrate");
const { createRepositories } = require("../src/repositories");
const { createApp } = require("../src/app");
const { loadConfig } = require("../src/config");
const { parseExtraction } = require("../src/services/receiptExtractor");

/* Leitura fixa de um cupom fictício, no formato que o extrator do Gemini devolve */
const leitura = {
  store_name: "Mercado Exemplo",
  cnpj: null,
  purchase_date: "2026-11-10T09:30:00",
  total_amount: 23.4,
  document_type: "cupom_fiscal",
  products: [
    { product_name: "Pão francês", quantity: 0.5, unit_price: 18.8, total_price: 9.4 },
    { product_name: "Café 250g", quantity: 1, unit_price: 14, total_price: 14 },
  ],
};

async function main() {
  const url = process.env.E2E_DATABASE_URL;
  if (!url) throw new Error("defina E2E_DATABASE_URL");
  const config = loadConfig({ ...process.env, DATABASE_URL: url });
  const pool = new Pool({ connectionString: url, max: 3 });
  await migrate(pool);
  const extractor = { extract: async () => parseExtraction(JSON.stringify(leitura)) };
  createApp({ repos: createRepositories(pool), extractor, config }).listen(config.port, () =>
    console.log(`API de teste na porta ${config.port}`)
  );
}

main().catch((err) => {
  console.error("Falha ao iniciar a API de teste:", err.message);
  process.exit(1);
});
/* Fim de servidor-e2e.js */
