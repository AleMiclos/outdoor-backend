const express = require("express");
const mongoose = require("mongoose");
const Tv = require("../models/TvModel");
const authenticateToken = require("../middleware/authenticateToken");
const authorizeRole = require("../middleware/authorizePermission");

const router = express.Router();

// Mapeamento dos modelos
const models = {
  tv: Tv,
  totem: Totem
};

// Verifica se o tipo é válido
const isValidType = (type) => Object.keys(models).includes(type);

// Verifica se o ID fornecido é válido para o MongoDB
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Criar um novo recurso (Apenas Admin pode criar)
router.post("/:type", authenticateToken, authorizeRole(["admin"]), async (req, res) => {
  const { type } = req.params;
  if (!isValidType(type)) {
    return res.status(400).json({ error: `Tipo '${type}' inválido. Tipos válidos: ${Object.keys(models).join(", ")}` });
  }

  try {
    const Model = models[type];
    const newItem = new Model({ ...req.body });
    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ message: `Erro ao criar ${type}`, error: error.message });
  }
});

// Buscar todos os recursos (Admin e usuários autorizados podem visualizar)
router.get("/:type", authenticateToken, async (req, res) => {
  const { type } = req.params;

  if (!isValidType(type)) {
    return res.status(400).json({ error: "Tipo inválido" });
  }

  try {
    const Model = models[type];

    // Filtrar os resultados com base nas permissões do usuário
    if (req.user.role !== "admin" && !req.user.permissions[type]) {
      return res.status(403).json({ error: "Acesso negado" });
    }

    const items = await Model.find().populate("user", "name email");
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: `Erro ao buscar ${type}s`, error: error.message });
  }
});


// Buscar um recurso por ID
router.get("/:type/:id", authenticateToken, async (req, res) => {
  const { type, id } = req.params;

  if (!isValidType(type) || !isValidObjectId(id)) {
    return res.status(400).json({ error: "Tipo ou ID inválido" });
  }

  try {
    const Model = models[type];

    if (req.user.role !== "admin" && !req.user.permissions[type]) {
      return res.status(403).json({ error: "Acesso negado" });
    }

    const item = await Model.findById(id).populate("user", "name email");
    if (!item) {
      return res.status(404).json({ message: `${type} não encontrado` });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: `Erro ao buscar ${type}`, error: error.message });
  }
});


// Atualizar um recurso (Somente Admin pode atualizar)
router.put("/:type/:id", authenticateToken, authorizeRole(["admin"]), async (req, res) => {
  const { type, id } = req.params;
  if (!isValidType(type) || !isValidObjectId(id)) {
    return res.status(400).json({ error: "Tipo inválido ou ID inválido" });
  }

  try {
    const Model = models[type];
    const updatedItem = await Model.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedItem) {
      return res.status(404).json({ message: `${type} não encontrado` });
    }
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: `Erro ao atualizar ${type}`, error: error.message });
  }
});

// Deletar um recurso (Somente Admin pode excluir)
router.delete("/:type/:id", authenticateToken, authorizeRole(["admin"]), async (req, res) => {
  const { type, id } = req.params;
  if (!isValidType(type) || !isValidObjectId(id)) {
    return res.status(400).json({ error: "Tipo inválido ou ID inválido" });
  }

  try {
    const Model = models[type];
    const deletedItem = await Model.findByIdAndDelete(id);
    if (!deletedItem) {
      return res.status(404).json({ message: `${type} não encontrado` });
    }
    res.json({ message: `${type} removido com sucesso` });
  } catch (error) {
    res.status(500).json({ message: `Erro ao remover ${type}`, error: error.message });
  }
});

// Atualizar status de um Totem
router.put("/totem/:id/status", authenticateToken, authorizeRole(["admin"]), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ error: "ID inválido" });
  }

  try {
    const totem = await Totem.findByIdAndUpdate(id, { status }, { new: true });
    if (!totem) {
      return res.status(404).json({ error: "Totem não encontrado" });
    }

    res.json(totem);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar o status do totem", details: error.message });
  }
});

module.exports = router;
