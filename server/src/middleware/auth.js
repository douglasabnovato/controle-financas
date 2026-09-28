/* Autenticação por token Bearer (uso pessoal): compara em tempo constante */
const crypto = require("crypto");
const { AppError } = require("../lib/errors");

/* Exige Authorization: Bearer <API_TOKEN> */
function requireToken(expected) {
  const expectedBuf = Buffer.from(expected);
  return (req, res, next) => {
    const [scheme, token] = String(req.headers.authorization || "").split(" ");
    const given = Buffer.from(token || "");
    const ok = scheme === "Bearer" && given.length === expectedBuf.length && crypto.timingSafeEqual(given, expectedBuf);
    if (!ok) return next(new AppError(401, "UNAUTHORIZED", "Informe o token de acesso."));
    return next();
  };
}

module.exports = { requireToken };
/* Fim de auth.js */
