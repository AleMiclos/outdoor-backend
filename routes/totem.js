const express = require('express');
const router = express.Router();
const Totem = require('../models/totem');
const authenticateToken = require("../middleware/authenticateToken");

// Criar um novo totem
router.post('/totem', authenticateToken, async (req, res) => {
  try {
    const { title, description, videoUrl, address, user } = req.body;

    if (!videoUrl) {
      return res.status(400).json({ message: "Forneça um link de vídeo." });
    }

    const newTotem = new Totem({ title, description, videoUrl, address, user });
    await newTotem.save();

    res.status(201).json(newTotem);
  } catch (error) {
    res.status(500).json({ message: "Erro ao criar totem", error: error.message });
  }
});

// Buscar todos os totens de um usuário
router.get('/totem/user/:userId', authenticateToken, async (req, res) => {
  try {
    const totems = await Totem.find({ user: req.params.userId });
    res.status(200).json(totems);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar totens", error: error.message });
  }
});

// Buscar um totem pelo ID
router.get('/totem/:totemId', authenticateToken, async (req, res) => {
  try {
    const totem = await Totem.findById(req.params.totemId);

    if (!totem) {
      return res.status(404).json({ message: "Totem não encontrado" });
    }

    res.status(200).json(totem);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar totem", error: error.message });
  }
});

// Atualizar um totem pelo ID
router.put('/totem/:totemId', authenticateToken, async (req, res) => {
  try {
    const { title, description, videoUrl, address, status } = req.body;

    if (!videoUrl) {
      return res.status(400).json({ message: "Forneça um link de vídeo." });
    }

    const updatedTotem = await Totem.findByIdAndUpdate(
      req.params.totemId,
      { title, description, videoUrl, address, status },
      { new: true, runValidators: true }
    );

    if (!updatedTotem) {
      return res.status(404).json({ message: "Totem não encontrado" });
    }

    res.status(200).json(updatedTotem);
  } catch (error) {
    res.status(500).json({ message: "Erro ao atualizar totem", error: error.message });
  }
});

// Deletar um totem pelo ID
router.delete('/totem/:totemId', authenticateToken, async (req, res) => {
  try {
    const deletedTotem = await Totem.findByIdAndDelete(req.params.totemId);

    if (!deletedTotem) {
      return res.status(404).json({ message: "Totem não encontrado" });
    }

    res.status(200).json({ message: "Totem deletado com sucesso" });
  } catch (error) {
    res.status(500).json({ message: "Erro ao deletar totem", error: error.message });
  }
});

module.exports = router;
