const express = require("express");
const router = express.Router();
const Totem = require("../models/totem");
const mongoose = require("mongoose");
const authenticateToken = require("../middleware/authenticateToken");

// Middleware para verificar o token
router.use(authenticateToken);

// Endpoint para buscar todos os totems
router.get("/totems", async (req, res) => {
  try {
    const totems = await Totem.find(); // Busca todos os totems
    res.json(totems);
  } catch (error) {
    console.error("Erro ao buscar todos os totems:", error);
    res.status(500).json({
      error: "Erro ao buscar todos os totems.",
      details: error.message,
    });
  }
});

// Endpoint para obter informações do totem por ID
router.get("/:totemId", async (req, res) => {
  const { totemId } = req.params;
  if (!totemId || totemId === "undefined") {
    return res.status(400).json({ error: "Totem ID inválido ou ausente." });
  }

  try {
    const totem = await Totem.findById(totemId);
    if (!totem) {
      return res.status(404).json({ error: "Totem não encontrado." });
    }
    res.json(totem);
  } catch (error) {
    console.error("Erro ao obter informações do totem:", error);
    res.status(500).json({
      error: "Erro ao obter informações do totem.",
      details: error.message,
    });
  }
});

// Endpoint para atualizar informações do totem por ID
router.post("/:totemId", async (req, res) => {
  const { totemId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(totemId)) {
    return res.status(400).json({ error: "ID do totem inválido." });
  }

  const { title, description, videoUrl, isActive } = req.body;
  if (!title || !description || !videoUrl) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios." });
  }

  try {
    const totem = await Totem.findByIdAndUpdate(
      totemId,
      { title, description, videoUrl, isActive },
      { new: true, runValidators: true }
    );
    if (!totem) {
      return res.status(404).json({ error: "Totem não encontrado." });
    }
    res.json(totem);
  } catch (error) {
    console.error("Erro ao atualizar informações do totem:", error);
    res.status(500).json({
      error: "Erro ao atualizar informações do totem.",
      details: error.message,
    });
  }
});

 router.delete('/:totemId', async (req, res) => {
  try {
    const { totemId } = req.params;

    // Verifica se o totem existe
    const totem = await Totem.findById(totemId);
    if (!totem) {
      return res.status(404).json({ message: 'Totem não encontrado.' });
    }

    // Deleta o totem
    await Totem.findByIdAndDelete(totemId);

    // Retorna uma mensagem de sucesso
    res.status(200).json({ message: 'Totem removido com sucesso!' });
  } catch (error) {
    console.error('Erro ao remover o totem:', error);
    res.status(500).json({ message: 'Erro ao remover o totem. Por favor, tente novamente.' });
  }
});  

module.exports = router;
