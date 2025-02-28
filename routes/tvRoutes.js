const express = require('express');
const router = express.Router();
const Tv = require('../models/TvModel');
const authenticateToken = require("../middleware/authenticateToken");


// Criar uma nova TV
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { youtubeLink1, youtubeLink2, address, user, status } = req.body;

    // Validação: Pelo menos um link deve ser fornecido
    if (!youtubeLink1 && !youtubeLink2) {
      return res.status(400).json({ message: "Forneça pelo menos um link do YouTube." });
    }

    // Validação: Verifica se os links do YouTube são válidos (opcional)
    if (youtubeLink1 && !youtubeLink1.includes('youtube.com') && !youtubeLink1.includes('youtu.be')) {
      return res.status(400).json({ message: "Primeiro link do YouTube inválido." });
    }
    
    if (youtubeLink2 && !youtubeLink2.includes('youtube.com') && !youtubeLink2.includes('youtu.be')) {
      return res.status(400).json({ message: "Segundo link do YouTube inválido." });
    }

    const newTv = new Tv({ youtubeLink1, youtubeLink2, address, user, status });
    await newTv.save();

    res.status(201).json(newTv);
  } catch (error) {
    res.status(500).json({ message: "Erro ao criar TV", error: error.message });
  }
});


// Buscar todas as TVs de um usuário
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const tvs = await Tv.find({ user: req.params.userId });
    res.status(200).json(tvs);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar TVs", error: error.message });
  }
});

// Buscar uma TV pelo ID
router.get('/:tvId', async (req, res) => {
  try {
    const tv = await Tv.findById(req.params.tvId);

    if (!tv) {
      return res.status(404).json({ message: "TV não encontrada" });
    }

    res.status(200).json(tv);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar TV", error: error.message });
  }
});

// Atualizar uma TV pelo ID
router.put('/:tvId', authenticateToken, async (req, res) => {
  try {
    const { youtubeLink, vimeoLink, address, status } = req.body;

    // Validação: Pelo menos um link deve ser informado
    if (!youtubeLink && !vimeoLink) {
      return res.status(400).json({ message: "Forneça pelo menos um link (YouTube ou Vimeo)." });
    }

    const updatedTv = await Tv.findByIdAndUpdate(
      req.params.tvId,
      { youtubeLink, vimeoLink, address, status },
      { new: true, runValidators: true }
    );

    if (!updatedTv) {
      return res.status(404).json({ message: "TV não encontrada" });
    }

    res.status(200).json(updatedTv);
  } catch (error) {
    res.status(500).json({ message: "Erro ao atualizar TV", error: error.message });
  }
});

// Deletar uma TV pelo ID
router.delete('/:tvId', authenticateToken, async (req, res) => {
  try {
    const deletedTv = await Tv.findByIdAndDelete(req.params.tvId);

    if (!deletedTv) {
      return res.status(404).json({ message: "TV não encontrada" });
    }

    res.status(200).json({ message: "TV deletada com sucesso" });
  } catch (error) {
    res.status(500).json({ message: "Erro ao deletar TV", error: error.message });
  }
});

// Atualiza o status da TV
router.post('/status-tv', async (req, res) => {
  console.log('Corpo da requisição:', req.body); // Log para depuração

  const { tvId, status } = req.body;

  // Validação dos dados
  if (!tvId || status === undefined) {
    console.error('Erro de validação: tvId e status são obrigatórios');
    return res.status(400).json({ error: 'tvId e status são obrigatórios' });
  }

  try {
    // Atualiza o status da TV no banco de dados
    const updatedTv = await Tv.findByIdAndUpdate(
      tvId,
      { status },
      { new: true } // Retorna o documento atualizado
    );

    if (!updatedTv) {
      console.error('TV não encontrada:', tvId);
      return res.status(404).json({ error: 'TV não encontrada' });
    }

    console.log('Status atualizado com sucesso:', updatedTv);
    res.status(200).json({ message: 'Status atualizado com sucesso', tv: updatedTv });
  } catch (err) {
    console.error('Erro ao atualizar status:', err);
    res.status(500).json({ error: 'Erro ao atualizar status' });
  }
});

// Obtém o status da TV
router.get('/status-tv/:tvId', async (req, res) => {
  const { tvId } = req.params;

  // Validação do tvId
  if (!tvId) {
    console.error('Erro de validação: tvId é obrigatório');
    return res.status(400).json({ error: 'tvId é obrigatório' });
  }

  try {
    // Busca o status da TV no banco de dados
    const tv = await Tv.findById(tvId).select('status');

    if (!tv) {
      console.error('TV não encontrada:', tvId);
      return res.status(404).json({ error: 'TV não encontrada' });
    }

    console.log('Status da TV encontrado:', tv);
    res.status(200).json({ status: tv.status });
  } catch (err) {
    console.error('Erro ao buscar status da TV:', err);
    res.status(500).json({ error: 'Erro ao buscar status da TV' });
  }
});


module.exports = router;