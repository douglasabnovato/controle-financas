/* Erro de aplicação com status HTTP e código estável para o cliente */
class AppError extends Error {
  /* Cria o erro com status, código e mensagem legível */
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

module.exports = { AppError };
/* Fim de errors.js */
