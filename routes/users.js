const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Ajuste o caminho para o modelo do usuário

// Rota para obter todos os usuários
router.get('/', async (_req, res) => {
  try {
    // Use o modelo User para buscar os usuários no banco de dados
    const users = await User.find({ role: 'cliente' });
    res.json(users); // Retorne os usuários como JSON
  } catch (error) {
    console.error('Erro ao obter usuários:', error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

module.exports = router;
