const authorizePermission = (permissions) => {
  return (req, res, next) => {
    if (req.user.role === "admin") {
      return next(); // Admin tem acesso total
    }

    // Verifica se req.user.permissions é um array antes de chamar .includes()
    if (!Array.isArray(req.user.permissions)) {
      return res.status(400).json({ message: "Permissões do usuário não definidas corretamente." });
    }

    // Verifica se o usuário tem pelo menos uma das permissões necessárias
    const hasPermission = permissions.some(permission => req.user.permissions.includes(permission));
    
    if (!hasPermission) {
      return res.status(403).json({ message: "Acesso negado: permissão insuficiente." });
    }
    
    next();
  };
};

module.exports = authorizePermission;
