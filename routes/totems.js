const express = require("express");
const router = express.Router();
const Totem = require("../models/totem");
const mongoose = require("mongoose");
const authenticateToken = require("../middleware/authenticateToken");

// Middleware para verificar o token
router.get('/', authenticateToken, async (req, res) => {
  try {
    const allTotems = await Totem.find();
    console.log(allTotems);

    res.status(200).json(allTotems);
  } catch (error) {
    console.error('Erro ao buscar os totens:', error);
    res.status(500).json({ error: 'Erro ao buscar os totens.' });
  }
});


// Endpoint para listar os totens do usuário autenticado
router.get('/totems/totems', authenticateToken, async (req, res) => {
  try {
    const userTotems = await Totem.find({ userId: req.user.userId });
    res.status(200).json(userTotems);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar os totens.' });
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
router.put('/:totemId', authenticateToken, async (req, res) => {
  const { totemId } = req.params;
  const { title, description, videoUrl, isActive, address, isOnline } = req.body;

  if (!mongoose.Types.ObjectId.isValid(totemId)) {
    return res.status(400).json({ error: 'ID do totem inválido.' });
  }

  try {
    const updatedTotem = await Totem.findByIdAndUpdate(
      totemId,
      { title, description, videoUrl, isActive, address, isOnline },
      { new: true, runValidators: true }
    );

    if (!updatedTotem) {
      return res.status(404).json({ error: 'Totem não encontrado.' });
    }

    res.json({ message: 'Totem atualizado com sucesso.', totem: updatedTotem });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar o totem.', details: error.message });
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

// Endpoint para criar um novo totem
router.post('/totems', authenticateToken, async (req, res) => {
  const { title, description, videoUrl, isActive, address, isOnline } = req.body;

  if (!title || !description || !videoUrl || !address) {
    return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos.' });
  }

  try {
    const newTotem = new Totem({
      title,
      description,
      videoUrl,
      isActive: isActive !== undefined ? isActive : true,
      isOnline: isOnline !== undefined ? isOnline : false,
      address,
      userId: req.user.userId,
    });

    await newTotem.save();
    res.status(201).json({ message: 'Totem criado com sucesso!', totem: newTotem });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar o totem.', details: error.message });
  }
});




module.exports = router;
