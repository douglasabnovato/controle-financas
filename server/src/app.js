/* API Express 5 do controle-financas: usuários, perfis (BUs), cupons com IA e dashboard */
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const multer = require("multer");
const rateLimit = require("express-rate-limit");
const { AppError } = require("./lib/errors");
const { userInput, profileInput, profileQuery } = require("./lib/schemas");
const { requireToken } = require("./middleware/auth");

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];

/* Valida com zod e converte falha em 400 */
function parse(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new AppError(400, "VALIDATION", "Dados inválidos.", result.error.issues.map((i) => ({ field: i.path.join("."), message: i.message })));
  }
  return result.data;
}

/* Monta a API com dependências injetadas (repos, extractor, config) */
function createApp({ repos, extractor, config }) {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  app.use(helmet());
  app.use(cors({ origin: config.corsOrigins, allowedHeaders: ["Authorization", "Content-Type"] }));
  app.use(express.json({ limit: "20kb" }));

  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: config.maxUploadBytes, files: 1 },
    fileFilter: (req, file, cb) =>
      IMAGE_TYPES.includes(file.mimetype) ? cb(null, true) : cb(new AppError(415, "UNSUPPORTED_TYPE", "Envie uma imagem JPG, PNG, WEBP ou HEIC.")),
  });
  const aiLimiter = rateLimit({ windowMs: 60_000, limit: 10, standardHeaders: "draft-7", legacyHeaders: false });

  app.get("/health", (req, res) => res.json({ status: "ok" }));
  app.get("/", (req, res) => res.json({ message: "API do controle-financas (learnTECH)", docs: "/health" }));

  const api = express.Router();
  api.use(requireToken(config.apiToken));

  api.post("/users", async (req, res) => {
    const user = await repos.users.create(parse(userInput, req.body));
    res.status(201).json({ message: "Usuário cadastrado.", user });
  });

  api.get("/users/:id", async (req, res) => {
    const { profile_id: id } = parse(profileQuery, { profile_id: req.params.id });
    const found = await repos.users.findWithProfiles(id);
    if (!found) throw new AppError(404, "NOT_FOUND", "Usuário não encontrado.");
    res.json(found);
  });

  api.post("/profiles", async (req, res) => {
    const profile = await repos.profiles.create(parse(profileInput, req.body));
    res.status(201).json({ message: "Perfil (BU) criado.", profile });
  });

  api.get("/receipts/dashboard/summary", async (req, res) => {
    const { profile_id } = parse(profileQuery, req.query);
    res.json(await repos.receipts.summary(profile_id));
  });

  api.get("/receipts", async (req, res) => {
    const { profile_id } = parse(profileQuery, req.query);
    const receipts = await repos.receipts.listByProfile(profile_id);
    res.json({ total: receipts.length, receipts });
  });

  api.get("/receipts/:id", async (req, res) => {
    const { profile_id } = parse(profileQuery, req.query);
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) throw new AppError(400, "VALIDATION", "Id de cupom inválido.");
    const found = await repos.receipts.findInProfile(id, profile_id);
    if (!found) throw new AppError(404, "NOT_FOUND", "Cupom não encontrado.");
    res.json(found);
  });

  api.post("/receipts/process", aiLimiter, upload.single("receipt_image"), async (req, res) => {
    if (!req.file) throw new AppError(400, "NO_FILE", "Nenhuma imagem de cupom enviada.");
    const { profile_id } = parse(profileQuery, req.body);
    if (!(await repos.profiles.exists(profile_id))) throw new AppError(404, "NOT_FOUND", "Perfil (BU) não encontrado.");
    const data = await extractor.extract(req.file.buffer, req.file.mimetype);
    const receipt = await repos.receipts.create(profile_id, data);
    if (!receipt) throw new AppError(409, "DUPLICATE", "Este cupom já foi cadastrado neste perfil.");
    res.status(201).json({ message: "Cupom processado e salvo.", receipt, products: data.products });
  });

  app.use("/api", api);

  app.use((req, res) => res.status(404).json({ error: "Rota não encontrada.", code: "NOT_FOUND" }));

  app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      const status = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
      return res.status(status).json({ error: status === 413 ? "Imagem acima do tamanho máximo." : err.message, code: err.code });
    }
    if (err instanceof AppError) {
      if (err.status >= 500) console.error(err.code, err.details || "");
      return res.status(err.status).json({ error: err.message, code: err.code, details: err.status < 500 ? err.details : undefined });
    }
    console.error(err);
    if (res.headersSent) return next(err);
    return res.status(500).json({ error: "Erro interno no servidor.", code: "INTERNAL" });
  });

  return app;
}

module.exports = { createApp };
/* Fim de app.js */
