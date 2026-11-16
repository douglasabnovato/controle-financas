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
  assert.deepEqual(dash.body.reading_review, { accepted: 0, corrected: 0, acceptance_rate: null });

  await auth(request(app).patch(`/api/receipts/${id}/review`)).send({ profile_id: other.body.profile.id, status: "accepted" }).expect(404);
  await auth(request(app).patch(`/api/receipts/${id}/review`)).send({ profile_id: pid, status: "talvez" }).expect(400);
  const reviewed = await auth(request(app).patch(`/api/receipts/${id}/review`)).send({ profile_id: pid, status: "accepted" }).expect(200);
  assert.equal(reviewed.body.receipt.review_status, "accepted");
  const after = await auth(request(app).get("/api/receipts/dashboard/summary")).query({ profile_id: pid }).expect(200);
  assert.deepEqual(after.body.reading_review, { accepted: 1, corrected: 0, acceptance_rate: 100 });
});

test("correctionInput recusa data inexistente, total zero e loja vazia (#29)", () => {
  const { correctionInput } = require("../src/lib/schemas");
  const pid = "00000000-0000-0000-0000-000000000000";
  const ok = correctionInput.parse({ profile_id: pid, store_name: " Mercado Certo ", purchase_date: "2026-11-09", total_amount: "25.5" });
  assert.deepEqual(ok, { profile_id: pid, store_name: "Mercado Certo", purchase_date: "2026-11-09", total_amount: 25.5 });
  assert.equal(correctionInput.safeParse({ ...ok, purchase_date: "2026-02-30" }).success, false);
  assert.equal(correctionInput.safeParse({ ...ok, purchase_date: "09/11/2026" }).success, false);
  assert.equal(correctionInput.safeParse({ ...ok, total_amount: 0 }).success, false);
  assert.equal(correctionInput.safeParse({ ...ok, store_name: "  " }).success, false);
});

test("correção da leitura: só o perfil dono, valida os campos e muda catálogo e painel (#29)", opts, async () => {
  const user = await auth(request(app).post("/api/users")).send({ full_name: "Pessoa Correcao", email: "correcao@empresa.test", nickname: "pc", whatsapp: "11900000002" }).expect(201);
  const pid = (await auth(request(app).post("/api/profiles")).send({ user_id: user.body.user.id, profile_name: "Casa" }).expect(201)).body.profile.id;
  const other = (await auth(request(app).post("/api/profiles")).send({ user_id: user.body.user.id, profile_name: "Outro" }).expect(201)).body.profile.id;
  nextExtraction = () => parseExtraction(JSON.stringify(sample));
  const id = (await auth(request(app).post("/api/receipts/process")).field("profile_id", pid).attach("receipt_image", png, { filename: "c.png", contentType: "image/png" }).expect(201)).body.receipt.id;
  nextExtraction = () => parseExtraction(JSON.stringify({ ...sample, total_amount: 50, purchase_date: "2026-09-12T10:00:00" }));
  await auth(request(app).post("/api/receipts/process")).field("profile_id", pid).attach("receipt_image", png, { filename: "d.png", contentType: "image/png" }).expect(201);

  const fix = { profile_id: pid, store_name: "Padaria Certa", purchase_date: "2026-09-11", total_amount: 25.5 };
  await request(app).patch(`/api/receipts/${id}`).send(fix).expect(401);
  await auth(request(app).patch(`/api/receipts/${id}`)).send({ ...fix, profile_id: other }).expect(404);
  await auth(request(app).patch(`/api/receipts/${id}`)).send({ ...fix, total_amount: 0 }).expect(400);
  await auth(request(app).patch(`/api/receipts/${id}`)).send({ ...fix, purchase_date: "2026-02-30" }).expect(400);
  await auth(request(app).patch("/api/receipts/abc")).send(fix).expect(400);

  const fixed = await auth(request(app).patch(`/api/receipts/${id}`)).send(fix).expect(200);
  assert.equal(fixed.body.receipt.store_name, "Padaria Certa");
  assert.equal(fixed.body.receipt.total_amount, 25.5);
  assert.equal(fixed.body.receipt.review_status, "corrected");
  const stored = await pool.query("SELECT to_char(purchase_date, 'YYYY-MM-DD HH24:MI') AS d FROM receipts WHERE id = $1", [id]);
  assert.equal(stored.rows[0].d, "2026-09-11 12:00");

  const detail = await auth(request(app).get(`/api/receipts/${id}`)).query({ profile_id: pid }).expect(200);
  assert.equal(detail.body.receipt.total_amount, 25.5);
  assert.equal(detail.body.products.length, 2);
  const dash = await auth(request(app).get("/api/receipts/dashboard/summary")).query({ profile_id: pid }).expect(200);
  assert.equal(dash.body.summary.total_spent, 75.5);
  assert.deepEqual(dash.body.reading_review, { accepted: 0, corrected: 1, acceptance_rate: 0 });

  const list = await auth(request(app).get("/api/receipts")).query({ profile_id: pid }).expect(200);
  const second = list.body.receipts.find((r) => r.id !== id);
  await auth(request(app).patch(`/api/receipts/${second.id}`)).send({ ...fix, total_amount: 25.5 }).expect(409);
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
