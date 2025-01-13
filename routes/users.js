const express = require('express');
const router = express.Router();

// Exemplo de rota
router.get('/', async (req, res) => {
  try {
    const users = await users.find(); // Certifique-se de que `User` é seu modelo
    res.json(users); // Certifique-se de retornar um array
  } catch (error) {
    console.error('Erro ao obter usuários:', error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});


module.exports = router;
