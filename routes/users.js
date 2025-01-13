const express = require('express');
const router = express.Router();

// Exemplo de rota
router.get('/', (req, res) => {
  res.send('Rota de usuários funcionando!');
});

module.exports = router;
