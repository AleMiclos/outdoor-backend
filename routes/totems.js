const express = require("express");
const router = express.Router();
const Totem = require("../models/totem");
const mongoose = require("mongoose");
const authenticateToken = require("../middleware/authenticateToken");

// Middleware para verificar o token

// Endpoint para listar os totens do usuário autenticado
router.get('/totems', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId; // Obtém o ID do usuário do token
    const userTotems = await Totem.find({ userId }); // Filtra pelos totens do usuário

    res.status(200).json(userTotems);
  } catch (error) {
    console.error('Erro ao buscar os totens:', error);
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
router.put("/:totemId", authenticateToken, async (req, res) => {
  const { totemId } = req.params;
  const { title, description, videoUrl, isActive } = req.body;

  console.log("Parâmetros da URL:", req.params);
  console.log("ID capturado:", req.params.totemId);

  // Verificar se o ID é válido
  if (!mongoose.Types.ObjectId.isValid(totemId)) {
    console.error("ID inválido:", totemId);
    return res.status(400).json({ error: "ID do totem inválido." });
  }

  // Verificar campos obrigatórios
  if (!title || !description || !videoUrl) {
    console.error("Campos obrigatórios ausentes.");
    return res.status(400).json({
      error: "Todos os campos obrigatórios devem ser preenchidos (title, description, videoUrl).",
    });
  }

  try {
    // Verificar se o totem existe no banco de dados
    const existingTotem = await Totem.findById(totemId);
    if (!existingTotem) {
      console.error("Totem não encontrado:", totemId);
      return res.status(404).json({ error: "Totem não encontrado." });
    }

    // Atualizar o totem no banco de dados
    const updatedTotem = await Totem.findByIdAndUpdate(
      totemId,
      { title, description, videoUrl, isActive },
      { new: true, runValidators: true }
    );

    console.log("Totem atualizado com sucesso:", updatedTotem);

    // Resposta de sucesso
    res.json({
      message: "Totem atualizado com sucesso.",
      totem: updatedTotem,
    });
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

// Endpoint para criar um novo totem
router.post('/totems', authenticateToken, async (req, res) => {
  const { title, description, videoUrl, isActive } = req.body;

  // Verifica se os campos obrigatórios estão presentes
  if (!title || !description || !videoUrl) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }

  try {
    // Cria o novo totem
    const newTotem = new Totem({
      title,
      description,
      videoUrl,
      isActive: isActive !== undefined ? isActive : true, // Valor padrão para `isActive`
      userId: req.user.userId, // Pega o ID do usuário autenticado
    });

    await newTotem.save();
    console.log('Novo totem criado:', newTotem);

    res.status(201).json({ message: 'Totem criado com sucesso!', totem: newTotem });
  } catch (error) {
    console.error('Erro ao criar o totem:', error);
    res.status(500).json({ error: 'Erro ao criar o totem.', details: error.message });
  }
});



module.exports = router;
