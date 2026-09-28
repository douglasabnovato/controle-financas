/* Configuração lida do ambiente (12-Factor III); falha cedo quando falta o essencial */
function loadConfig(env = process.env) {
  return {
    port: Number(env.PORT) || 3000,
    databaseUrl: env.DATABASE_URL || "",
    databaseSsl: env.DATABASE_SSL !== "0",
    apiToken: env.API_TOKEN || "",
    corsOrigins: (env.CORS_ORIGINS || "http://localhost:5173").split(",").map((s) => s.trim()).filter(Boolean),
    geminiModel: env.GEMINI_MODEL || "gemini-3.6-flash",
    maxUploadBytes: Number(env.MAX_UPLOAD_MB || 5) * 1024 * 1024,
  };
}

/* Lista as variáveis obrigatórias ausentes */
function missing(config) {
  const out = [];
  if (!config.databaseUrl) out.push("DATABASE_URL");
  if (!config.apiToken || config.apiToken.length < 24) out.push("API_TOKEN (mínimo 24 caracteres)");
  return out;
}

module.exports = { loadConfig, missing };
/* Fim de config.js */
