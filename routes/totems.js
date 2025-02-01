const express = require("express");
const router = express.Router();
const Totem = require("../models/totem");
const mongoose = require("mongoose");
const authenticateToken = require("../middleware/authenticateToken");

// Rota para buscar todos os totens cadastrados
router.get('/', authenticateToken, async (req, res) => {
  try {
    const allTotems = await Totem.find();
    res.status(200).json(allTotems);
  } catch (error) {
    console.error('Erro ao buscar os totens:', error);
    res.status(500).json({ error: 'Erro ao buscar os totens.' });
  }
});


router.get('/by-user-id/:userId', authenticateToken, async (req, res) => {
  const { userId } = req.params; // Obtém o userId da URL
  const requestingUserId = req.user.userId; // Obtém o userId do usuário autenticado
  const requestingUserRole = req.user.role; // Obtém a role do usuário autenticado

  // Verifica se o usuário autenticado tem permissão para acessar os totens
  if (requestingUserId !== userId && requestingUserRole !== 'admin') {
    return res.status(403).json({ message: 'Acesso negado. Você não tem permissão para acessar este recurso.' });
  }

  try {
    const userTotems = await Totem.find({ userId });

    if (!userTotems.length) {
      return res.status(404).json({ message: "Nenhum totem encontrado para este usuário." });
    }

    res.status(200).json(userTotems);
  } catch (error) {
    console.error('Erro ao buscar totens:', error);
    res.status(500).json({ error: 'Erro ao buscar os totens.' });
  }
});

// Rota para listar um totem
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
    console.error("ID inválido:", totemId);
    return res.status(400).json({ error: "ID do totem inválido." });
  }

  // Verificar campos obrigatórios
  if (title, description, videoUrl, isActive, address, isOnline) {
    console.error("Campos obrigatórios ausentes.");
    return res.status(400).json({
      error: "Todos os campos obrigatórios devem ser preenchidos (title, description, videoUrl).",
    });
  }

  try {
    const updatedTotem = await Totem.findByIdAndUpdate(
      totemId,
      { title, description, videoUrl, address },
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
router.post('/new-totem', authenticateToken, async (req, res) => {
  const { title, description, videoUrl, isActive, address, isOnline } = req.body;

  // Verifica se os campos obrigatórios estão presentes
  if (!title || !description || !videoUrl || !address) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }

  try {
    const newTotem = new Totem({
      title,
      description,
      videoUrl,
      address,
      isActive: isActive !== undefined ? isActive : true,
      // isOnline: isOnline !== undefined ? isOnline : false,
      userId: req.user.userId, // Pega o ID do usuário autenticado
    });

    await newTotem.save();
    res.status(201).json({ message: 'Totem criado com sucesso!', totem: newTotem });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar o totem.', details: error.message });
  }
});


router.put("/totems/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const totem = await Totem.findByIdAndUpdate(
      id,
      { status },
      { new: true } // Retorna o documento atualizado
    );

    if (!totem) {
      return res.status(404).json({ error: "Totem não encontrado" });
    }

    res.json(totem);
  } catch (err) {
    res.status(500).json({ error: "Erro ao atualizar o status do totem" });
  }
});

module.exports = router;



module.exports = router;
