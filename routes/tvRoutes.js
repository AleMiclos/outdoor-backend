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
router.post('/tv', async (req, res) => {
  try {
    const newTv = new Tv(req.body);
    const savedTv = await newTv.save();
    res.status(201).json(savedTv);
  } catch (err) {
    res.status(400).json({ error: err.message });
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
