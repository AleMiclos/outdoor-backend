const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/User");
const authenticateToken = require("../middleware/authenticateToken");
const authorizeRole = require("../middleware/authorizePermission");

const router = express.Router();

// Buscar todos os usuários (Admin pode visualizar todos os usuários)
router.get("/", authenticateToken, authorizeRole(["admin"]), async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar usuários", error: error.message });
  }
});

// Buscar um usuário por ID e suas permissões


// Atualizar um usuário (Somente Admin pode atualizar)
router.put("/:id", authenticateToken, async (req, res) => {
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

// Deletar um usuário (Somente Admin pode excluir)
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

// Buscar usuários com permissão para TV
router.get('/tv', authenticateToken, async (req, res) => {
  try {
    console.log("Buscando usuários com permissão para TV...");
    const users = await User.find({ "permissions.tvs": true }, "name email permissions");
    console.log("Usuários encontrados:", users);
    res.json(users);
  } catch (err) {
    console.error("Erro na rota /users/tv:", err);
    res.status(500).json({ message: 'Erro ao buscar usuários com permissão para TV', error: err.message });
  }
});

// Buscar um usuário por ID e suas permissões (deixe essa abaixo)
router.get("/:id", authenticateToken, authorizeRole(["admin"]), async (req, res) => {
  const { id } = req.params;
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


module.exports = router;
