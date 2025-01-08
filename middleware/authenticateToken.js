const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  console.log("Token recebido no middleware:", authHeader); // Log adicional

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(403).json({ error: "Token não fornecido ou inválido." });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error("Erro ao verificar token:", err.message); // Log do erro
      return res.status(403).json({ error: "Token inválido ou expirado." });
    }

    req.user = user; // Armazena os dados do token no objeto da requisição
    console.log("Usuário autenticado:", user); // Log do usuário autenticado
    next();
  });
};

module.exports = authenticateToken;
