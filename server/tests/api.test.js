/* Testes da API com PostgreSQL real (TEST_DATABASE_URL) e extrator de IA falso */
const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const { Pool } = require("pg");
const { migrate } = require("../src/db/migrate");
const { createRepositories } = require("../src/repositories");
const { createApp } = require("../src/app");
const { parseExtraction } = require("../src/services/receiptExtractor");
const { loadConfig } = require("../src/config");

const url = process.env.TEST_DATABASE_URL;
const TOKEN = "t".repeat(32);
const opts = { skip: url ? false : "defina TEST_DATABASE_URL" };
let pool;
let app;
let nextExtraction;

const fakeExtractor = { extract: async () => nextExtraction() };
const auth = (r) => r.set("Authorization", `Bearer ${TOKEN}`);
const png = Buffer.from("89504e470d0a1a0a", "hex");

const sample = {
  store_name: "Padaria Pão Quente",
  cnpj: "12.345.678/0001-90",
  purchase_date: "2026-09-10T08:15:00",
  total_amount: "23,40".replace(",", "."),
  document_type: "cupom_fiscal",
  products: [
    { product_name: "Pão francês", quantity: 0.5, unit_price: 18.8, total_price: 9.4 },
    { product_name: "Café 250g", quantity: 1, unit_price: 14, total_price: 14 },
  ],
};

test("parseExtraction aceita JSON com cercas e rejeita dados incompletos", () => {
  const ok = parseExtraction("```json\n" + JSON.stringify(sample) + "\n```");
  assert.equal(ok.total_amount, 23.4);
  assert.equal(ok.products.length, 2);
  assert.throws(() => parseExtraction("não é json"), /Não foi possível ler/);
  assert.throws(() => parseExtraction(JSON.stringify({ store_name: "" })), /incompletos/);
});

before(async () => {
  if (!url) return;
  pool = new Pool({ connectionString: url });
  await pool.query("DROP TABLE IF EXISTS products, receipts, profiles, users CASCADE");
  await migrate(pool);
  await migrate(pool);
  const config = { ...loadConfig({}), apiToken: TOKEN };
  app = createApp({ repos: createRepositories(pool), extractor: fakeExtractor, config });
});
after(async () => pool && pool.end());

test("sem token a API responde 401; /health é público", opts, async () => {
  await request(app).get("/health").expect(200);
  await request(app).get("/api/receipts").query({ profile_id: "00000000-0000-0000-0000-000000000000" }).expect(401);
  await request(app).get("/api/receipts").set("Authorization", "Bearer errado").expect(401);
});

test("fluxo completo: usuário → perfil → cupom → lista → detalhe → dashboard", opts, async () => {
  const user = await auth(request(app).post("/api/users")).send({ full_name: "Douglas Teste", email: "D@EX.COM", nickname: "dg", whatsapp: "(32) 99999-0000" }).expect(201);
  assert.equal(user.body.user.email, "d@ex.com");
  assert.equal(user.body.user.whatsapp, undefined);
  const profile = await auth(request(app).post("/api/profiles")).send({ user_id: user.body.user.id, profile_name: "Pessoal" }).expect(201);
  const pid = profile.body.profile.id;

  nextExtraction = () => parseExtraction(JSON.stringify(sample));
  const created = await auth(request(app).post("/api/receipts/process")).field("profile_id", pid).attach("receipt_image", png, { filename: "c.png", contentType: "image/png" }).expect(201);
  assert.match(created.body.receipt.code, /^C\d{3}$/);

  const dup = await auth(request(app).post("/api/receipts/process")).field("profile_id", pid).attach("receipt_image", png, { filename: "c.png", contentType: "image/png" }).expect(409);
  assert.equal(dup.body.code, "DUPLICATE");

  const list = await auth(request(app).get("/api/receipts")).query({ profile_id: pid }).expect(200);
  assert.equal(list.body.total, 1);
  assert.equal(list.body.receipts[0].total_amount, 23.4);

  const id = list.body.receipts[0].id;
  const detail = await auth(request(app).get(`/api/receipts/${id}`)).query({ profile_id: pid }).expect(200);
  assert.equal(detail.body.products.length, 2);
  assert.equal(detail.body.products[0].quantity + detail.body.products[1].quantity, 1.5);

  const other = await auth(request(app).post("/api/profiles")).send({ user_id: user.body.user.id, profile_name: "Viagem" }).expect(201);
  await auth(request(app).get(`/api/receipts/${id}`)).query({ profile_id: other.body.profile.id }).expect(404);

  const dash = await auth(request(app).get("/api/receipts/dashboard/summary")).query({ profile_id: pid }).expect(200);
  assert.deepEqual(dash.body.summary, { total_receipts: 1, total_spent: 23.4, average_ticket: 23.4 });
});

test("upload inválido: sem arquivo 400, tipo errado 415, perfil inexistente 404", opts, async () => {
  const pid = "00000000-0000-0000-0000-000000000000";
  await auth(request(app).post("/api/receipts/process")).field("profile_id", pid).expect(400);
  await auth(request(app).post("/api/receipts/process")).field("profile_id", pid).attach("receipt_image", Buffer.from("x"), { filename: "a.txt", contentType: "text/plain" }).expect(415);
  await auth(request(app).post("/api/receipts/process")).field("profile_id", pid).attach("receipt_image", png, { filename: "c.png", contentType: "image/png" }).expect(404);
});

test("validação: e-mail inválido e profile_id que não é UUID viram 400", opts, async () => {
  const res = await auth(request(app).post("/api/users")).send({ full_name: "X", email: "x", nickname: "", whatsapp: "1" }).expect(400);
  assert.ok(res.body.details.length >= 3);
  await auth(request(app).get("/api/receipts")).query({ profile_id: "1 OR 1=1" }).expect(400);
});

test("IA indisponível vira 502 com mensagem amigável", opts, async () => {
  const { AppError } = require("../src/lib/errors");
  const user = await auth(request(app).post("/api/users")).send({ full_name: "Outra Pessoa", email: "o@ex.com", nickname: "op", whatsapp: "32999990001" });
  const profile = await auth(request(app).post("/api/profiles")).send({ user_id: user.body.user.id, profile_name: "Teste" });
  nextExtraction = () => { throw new AppError(502, "AI_UNAVAILABLE", "O serviço de leitura de cupons está indisponível."); };
  const res = await auth(request(app).post("/api/receipts/process")).field("profile_id", profile.body.profile.id).attach("receipt_image", png, { filename: "c.png", contentType: "image/png" }).expect(502);
  assert.equal(res.body.code, "AI_UNAVAILABLE");
});
/* Fim de api.test.js */
