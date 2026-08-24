const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Rota de Teste do Servidor
app.get('/', (req, res) => {
  res.json({ message: 'API do controle-financas rodando com sucesso no ecossistema LearnTECH!' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});