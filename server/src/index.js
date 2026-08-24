const express = require('express');
const cors = require('cors');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');
const profileRoutes = require('./routes/profileRoutes');
const receiptRoutes = require('./routes/receiptRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Registrar Rotas da API
app.use('/api/users', userRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/receipts', receiptRoutes);

// Rota de Teste do Servidor
app.get('/', (req, res) => {
  res.json({ message: 'API do controle-financas rodando com sucesso no ecossistema learnTECH!' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});