const express = require('express');
const router = express.Router();
const Tv = require('../models/TvModel');

// Criar uma nova TV
router.post('/tv', async (req, res) => {
  try {
    const { youtubeLink, vimeoLink, address, user, status } = req.body;

    // Validação: Pelo menos um link deve ser fornecido
    if (!youtubeLink && !vimeoLink) {
      return res.status(400).json({ message: "Forneça pelo menos um link (YouTube ou Vimeo)." });
    }

    // Validação: Verifica se o link do YouTube é válido (opcional)
    if (youtubeLink && !youtubeLink.includes('youtube.com') && !youtubeLink.includes('youtu.be')) {
      return res.status(400).json({ message: "Link do YouTube inválido." });
    }

    // Validação: Verifica se o link do Vimeo é válido (opcional)
    if (vimeoLink && !vimeoLink.includes('vimeo.com')) {
      return res.status(400).json({ message: "Link do Vimeo inválido." });
    }

    const newTv = new Tv({ youtubeLink, vimeoLink, address, user, status });
    await newTv.save();

    res.status(201).json(newTv);
  } catch (error) {
    res.status(500).json({ message: "Erro ao criar TV", error: error.message });
  }
});

// Buscar todas as TVs de um usuário
router.get('/tv/user/:userId', async (req, res) => {
  try {
    const tvs = await Tv.find({ user: req.params.userId });
    res.status(200).json(tvs);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar TVs", error: error.message });
  }
});

// Buscar uma TV pelo ID
router.get('/tv/:tvId', async (req, res) => {
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
router.put('/tv/:tvId', async (req, res) => {
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
router.delete('/tv/:tvId', async (req, res) => {
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

module.exports = router;