const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/User");
const Totem = require("../models/totem"); // Modelo de Totem (crie esse modelo se ainda não tiver)
const authenticateToken = require("../middleware/authenticateToken");
const authorizeRole = require("../middleware/authorizePermission");

const router = express.Router();

// Buscar todos os usuários
router.get("/", authenticateToken, authorizeRole(["admin"]), async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar usuários", error: error.message });
  }
});

// Buscar um usuário por ID e suas permissões
router.get("/:id", authenticateToken, authorizeRole(["admin"]), async (req, res) => {
  const { id } = req.params;
  
  console.log("ID recebido:", id);  // Debugging para verificar o valor do ID

  try {
    const user = await User.findById(id).populate('permissions');
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar usuário", error: error.message });
  }
});

// Atualizar um usuário (Apenas Admin)
router.put("/:id", authenticateToken, authorizeRole(["admin"]), async (req, res) => {
  const { id } = req.params;

  try {
    const updatedUser = await User.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedUser) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Erro ao atualizar usuário", error: error.message });
  }
});

// Deletar um usuário (Apenas Admin)
router.delete("/:id", authenticateToken, authorizeRole(["admin"]), async (req, res) => {
  const { id } = req.params;

  try {
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }
    res.json({ message: "Usuário removido com sucesso" });
  } catch (error) {
    res.status(500).json({ message: "Erro ao remover usuário", error: error.message });
  }
});

// Atualizar permissões do usuário para TVs e Totens
router.put("/permissions/:id", authenticateToken, authorizeRole(["admin"]), async (req, res) => {
  const { id } = req.params;
  const { tvs, totens } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(id, { 
      "permissions.tvs": tvs, 
      "permissions.totens": totens 
    }, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: "Erro ao atualizar permissões" });
  }
});

// Buscar TVs atribuídas a um usuário
router.get('/user/:id/tvs', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id).populate('assignedTvs');
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }
    res.json(user.assignedTvs);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar TVs do usuário' });
  }
});

// Buscar Totens atribuídos a um usuário
router.get('/user/:id/totens', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id).populate('assignedTotens');
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }
    res.json(user.assignedTotens);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar Totens do usuário' });
  }
});

// Buscar usuários com permissão para TV
// Buscar usuários com permissão para TV
router.get('/permissions/tvs', authenticateToken, async (req, res) => {
  console.log("Rota /permissions/tvs chamada");
  try {
    const users = await User.find({ "permissions.tvs": true }, "name email permissions");
    res.json(users);
  } catch (err) {
    console.error("Erro ao buscar usuários com permissão para TV:", err);
    res.status(500).json({ message: 'Erro ao buscar usuários com permissão para TV', error: err.message });
  }
});

// Buscar usuários com permissão para Totens
router.get('/permissions/totens', authenticateToken, async (req, res) => {
  console.log("Rota /permissions/totens chamada");
  try {
    const users = await User.find({ "permissions.totens": true }, "name email permissions");
    res.json(users);
  } catch (err) {
    console.error("Erro ao buscar usuários com permissão para Totens:", err);
    res.status(500).json({ message: 'Erro ao buscar usuários com permissão para Totens', error: err.message });
  }
});


module.exports = router;
