const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Supondo que o token seja passado como "Bearer token"

  if (!token) {
    return res.status(401).json({ message: "Token de autenticação não encontrado." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Token inválido." });
    }
    req.user = user; // Atribuindo o payload do token ao req.user
    next();
  });
};

module.exports = authenticateToken;
