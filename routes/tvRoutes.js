const express = require('express');
const router = express.Router();
const Tv = require('../models/TvModel');
const authenticateToken = require("../middleware/authenticateToken");

// Exportar uma função que recebe o WebSocket Server (wss)
module.exports = (wss) => {
  // Criar uma nova TV
  router.post('/', authenticateToken, async (req, res) => {
    try {
      const { vimeoLink, plutoLink, address, user, status } = req.body;

      // Validação: Pelo menos um link deve ser fornecido
      if (!vimeoLink && !plutoLink) {
        return res.status(400).json({ message: "Forneça pelo menos um link (Vimeo ou Pluto TV)." });
      }

      // Validação: Verifica se o link do Vimeo é válido (opcional)
      if (vimeoLink && !vimeoLink.includes('vimeo.com')) {
        return res.status(400).json({ message: "Link do Vimeo inválido." });
      }

      const newTv = new Tv({ vimeoLink, plutoLink, address, user, status });
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
      if (!tv) return res.status(404).json({ message: "TV não encontrada" });

      res.status(200).json(tv);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar TV", error: error.message });
    }
  });

  // Atualizar uma TV pelo ID
  router.put("/:tvId", authenticateToken, async (req, res) => {
    try {
      const { vimeoLink, plutoLink, address, status } = req.body;
      const tvId = req.params.tvId;

      if (!vimeoLink && !plutoLink) {
        return res.status(400).json({ message: "Forneça pelo menos um link (Vimeo ou Pluto TV)." });
      }

      const updatedTv = await Tv.findByIdAndUpdate(
        tvId,
        { vimeoLink, plutoLink, address, status },
        { new: true, runValidators: true }
      );

      if (!updatedTv) return res.status(404).json({ message: "TV não encontrada" });

      wss.clients.forEach((client) => {
        if (client.readyState === 1) {
          client.send(JSON.stringify({
            type: "tvUpdate",
            tvId: updatedTv._id,
            tv: updatedTv
          }));
        }
      });

      res.status(200).json(updatedTv);
    } catch (error) {
      res.status(500).json({ message: "Erro ao atualizar TV", error: error.message });
    }
  });

  // Deletar uma TV pelo ID
  router.delete('/:tvId', authenticateToken, async (req, res) => {
    try {
      const deletedTv = await Tv.findByIdAndDelete(req.params.tvId);
      if (!deletedTv) return res.status(404).json({ message: "TV não encontrada" });

      res.status(200).json({ message: "TV deletada com sucesso" });
    } catch (error) {
      res.status(500).json({ message: "Erro ao deletar TV", error: error.message });
    }
  });

  // Atualiza o status geral da TV
  router.post("/status-tv", async (req, res) => {
    const { tvId, status } = req.body;
    if (!tvId || status === undefined) {
      return res.status(400).json({ error: "tvId e status são obrigatórios" });
    }

    try {
      const updatedTv = await Tv.findByIdAndUpdate(
        tvId,
        { status, lastUpdate: Date.now() },
        { new: true }
      );

      if (!updatedTv) return res.status(404).json({ error: "TV não encontrada" });

      broadcastTvStatus(updatedTv);
      res.status(200).json({ message: "Status atualizado com sucesso", tv: updatedTv });
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
      res.status(500).json({ error: "Erro ao atualizar status" });
    }
  });

  // Atualiza o status do Vimeo
  router.post("/status-vimeo", async (req, res) => {
    const { tvId, status } = req.body;
    if (!tvId || status === undefined) {
      return res.status(400).json({ error: "tvId e status são obrigatórios" });
    }

    try {
      const updatedTv = await Tv.findByIdAndUpdate(
        tvId,
        { vimeoStatus: status, lastUpdate: Date.now() },
        { new: true }
      );

      if (!updatedTv) return res.status(404).json({ error: "TV não encontrada" });

      broadcastTvStatus(updatedTv);
      res.status(200).json({ message: "Status do Vimeo atualizado", tv: updatedTv });
    } catch (err) {
      console.error("Erro ao atualizar status do Vimeo:", err);
      res.status(500).json({ error: "Erro ao atualizar status do Vimeo" });
    }
  });

  // Função para enviar WebSocket
  function broadcastTvStatus(updatedTv) {
    if (!updatedTv) return;

    const payload = {
      type: "statusUpdate",
      tvId: updatedTv._id,
      status: updatedTv.status,
      vimeoStatus: updatedTv.vimeoStatus,
      lastUpdate: updatedTv.lastUpdate,
    };

    wss.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(JSON.stringify(payload));
      }
    });

    console.log("🔄 Status atualizado via WebSocket:", payload);
  }

  // GET status atual da TV
  router.get("/status-tv/:tvId", async (req, res) => {
    const { tvId } = req.params;
    try {
      const tv = await Tv.findById(tvId).select("status vimeoStatus");
      if (!tv) return res.status(404).json({ error: "TV não encontrada" });

      res.status(200).json({
        status: tv.status,
        vimeoStatus: tv.vimeoStatus
      });
    } catch (err) {
      res.status(500).json({ error: "Erro ao buscar status da TV" });
    }
  });

  // GET status do Vimeo
  router.get("/status-vimeo/:tvId", async (req, res) => {
    const { tvId } = req.params;
    try {
      const tv = await Tv.findById(tvId).select("vimeoStatus");
      if (!tv) return res.status(404).json({ error: "TV não encontrada" });

      res.status(200).json({ vimeoStatus: tv.vimeoStatus });
    } catch (err) {
      res.status(500).json({ error: "Erro ao buscar status do Vimeo" });
    }
  });

  return router;
};
