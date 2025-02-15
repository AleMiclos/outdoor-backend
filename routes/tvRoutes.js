const express = require('express');
const router = express.Router();
const Tv = require('../models/TvModel');
const { isValidObjectId } = require('mongoose');

// Buscar todas as TVs
router.get('/tv', async (req, res) => {
  try {
    const tvs = await Tv.find().populate('user', 'name email');
    res.json(tvs);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar TVs' });
  }
});

// Buscar TVs por usuário
router.get('/tv/:userId', async (req, res) => {
  const { userId } = req.params;
  if (!isValidObjectId(userId)) {
    return res.status(400).json({ error: 'ID de usuário inválido' });
  }
  try {
    const tvs = await Tv.find({ user: userId });
    res.json(tvs);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar TVs do usuário' });
  }
});

// Adicionar TV
router.post("/tv", async (req, res) => {
  try {
    console.log("Recebendo dados:", req.body); // <-- Verificar se o `user` está vindo corretamente

    const tv = new Tv(req.body);
    await tv.save();
    res.status(201).json(tv);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});



// Atualizar TV
router.put('/tv/:tvId', async (req, res) => {
  const { tvId } = req.params;
  if (!isValidObjectId(tvId)) {
    return res.status(400).json({ error: 'ID de TV inválido' });
  }
  try {
    const updatedTv = await Tv.findByIdAndUpdate(tvId, req.body, { new: true, runValidators: true });
    if (!updatedTv) {
      return res.status(404).json({ error: 'TV não encontrada' });
    }
    res.json(updatedTv);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Excluir TV
router.delete('/tv/:tvId', async (req, res) => {
  const { tvId } = req.params;
  if (!isValidObjectId(tvId)) {
    return res.status(400).json({ error: 'ID de TV inválido' });
  }
  try {
    const deletedTv = await Tv.findByIdAndDelete(tvId);
    if (!deletedTv) {
      return res.status(404).json({ error: 'TV não encontrada' });
    }
    res.json({ message: 'TV deletada com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao deletar TV' });
  }
});

module.exports = router;
