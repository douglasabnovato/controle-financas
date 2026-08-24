const db = require('../database/connection');

// Criar perfil / Business Unit (BU)
async function createProfile(req, res) {
  const { user_id, profile_name } = req.body;
  try {
    const query = `
      INSERT INTO profiles (user_id, profile_name)
      VALUES ($1, $2)
      RETURNING *;
    `;
    const values = [user_id, profile_name];
    const result = await db.query(query, values);
    return res.status(201).json({
      message: 'Business Unit (Perfil) criada com sucesso!',
      profile: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao criar perfil:', error);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}

module.exports = {
  createProfile
};