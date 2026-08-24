const db = require('../database/connection');

// Cadastrar novo usuário
async function createUser(req, res) {
  const { full_name, email, nickname, whatsapp } = req.body;
  try {
    const query = `
      INSERT INTO users (full_name, email, nickname, whatsapp)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [full_name, email, nickname, whatsapp];
    const result = await db.query(query, values);
    return res.status(201).json({
      message: 'Usuário cadastrado com sucesso!',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao cadastrar usuário:', error);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}

// Buscar usuário e seus perfis
async function getUserById(req, res) {
  const { id } = req.params;
  try {
    const userQuery = 'SELECT * FROM users WHERE id = $1';
    const userResult = await db.query(userQuery, [id]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    const profilesQuery = 'SELECT * FROM profiles WHERE user_id = $1';
    const profilesResult = await db.query(profilesQuery, [id]);

    return res.json({
      user: userResult.rows[0],
      profiles: profilesResult.rows
    });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}

module.exports = {
  createUser,
  getUserById
};