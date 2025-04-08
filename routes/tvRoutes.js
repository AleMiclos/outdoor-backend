const express = require('express');
const router = express.Router();
const Tv = require('../models/TvModel');
const authenticateToken = require("../middleware/authenticateToken");

module.exports = (wss) => {
  // Criar uma nova TV
  router.post('/', authenticateToken, async (req, res) => {
    try {
      const { plutoLink, vimeoLink, address, user, status } = req.body;

      if (!plutoLink && !vimeoLink) {
        return res.status(400).json({ message: "Forneça pelo menos um link (Pluto ou Vimeo)." });
      }

      if (vimeoLink && !vimeoLink.includes('vimeo.com')) {
        return res.status(400).json({ message: "Link do Vimeo inválido." });
      }

      const newTv = new Tv({ plutoLink, vimeoLink, address, user, status });
      await newTv.save();

      res.status(201).json(newTv);
    } catch (error) {
      res.status(500).json({ message: "Erro ao criar TV", error: error.message });
    }
  });

  router.get('/user/:userId', authenticateToken, async (req, res) => {
    try {
      const tvs = await Tv.find({ user: req.params.userId });
      res.status(200).json(tvs);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar TVs", error: error.message });
    }
  });

  router.get('/:tvId', async (req, res) => {
    try {
      const tv = await Tv.findById(req.params.tvId);
      if (!tv) return res.status(404).json({ message: "TV não encontrada" });
      res.status(200).json(tv);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar TV", error: error.message });
    }
  });

  router.put("/:tvId", authenticateToken, async (req, res) => {
    try {
      const { plutoLink, vimeoLink, address, status } = req.body;
      const tvId = req.params.tvId;

      if (!plutoLink && !vimeoLink) {
        return res.status(400).json({ message: "Forneça pelo menos um link (Pluto ou Vimeo)." });
      }

      const updatedTv = await Tv.findByIdAndUpdate(
        tvId,
        { plutoLink, vimeoLink, address, status },
        { new: true, runValidators: true }
      );

      if (!updatedTv) {
        return res.status(404).json({ message: "TV não encontrada" });
      }

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

  router.delete('/:tvId', authenticateToken, async (req, res) => {
    try {
      const deletedTv = await Tv.findByIdAndDelete(req.params.tvId);
      if (!deletedTv) return res.status(404).json({ message: "TV não encontrada" });
      res.status(200).json({ message: "TV deletada com sucesso" });
    } catch (error) {
      res.status(500).json({ message: "Erro ao deletar TV", error: error.message });
    }
  });

  router.get('/status-tv', async (req, res) => {
    try {
      const latestTv = await Tv.findOne().sort({ lastUpdate: -1 }).select('lastUpdate');
      if (!latestTv) return res.status(404).json({ error: 'Nenhuma TV encontrada' });
      res.status(200).json({ lastUpdate: latestTv.lastUpdate });
    } catch (err) {
      res.status(500).json({ error: 'Erro ao buscar atualização da TV' });
    }
  });

  function broadcastTvStatus(updatedTv) {
    if (!updatedTv) return;

    const payload = {
      type: "statusUpdate",
      tvId: updatedTv._id,
      status: updatedTv.status,
      vimeoStatus: updatedTv.vimeoStatus,
      plutoStatus: updatedTv.plutoStatus,
      lastUpdate: updatedTv.lastUpdate,
    };

    wss.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(JSON.stringify(payload));
      }
    });

    console.log("🔄 Status atualizado enviado via WebSocket:", payload);
  }

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
      res.status(200).json({ message: "Status da TV atualizado", tv: updatedTv });
    } catch (err) {
      res.status(500).json({ error: "Erro ao atualizar status da TV" });
    }
  });

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
      res.status(500).json({ error: "Erro ao atualizar status do Vimeo" });
    }
  });

  router.post("/status-pluto", async (req, res) => {
    const { tvId, status } = req.body;

    if (!tvId || status === undefined) {
      return res.status(400).json({ error: "tvId e status são obrigatórios" });
    }

    try {
      const updatedTv = await Tv.findByIdAndUpdate(
        tvId,
        { plutoStatus: status, lastUpdate: Date.now() },
        { new: true }
      );

      if (!updatedTv) return res.status(404).json({ error: "TV não encontrada" });

      broadcastTvStatus(updatedTv);
      res.status(200).json({ message: "Status do Pluto atualizado", tv: updatedTv });
    } catch (err) {
      res.status(500).json({ error: "Erro ao atualizar status do Pluto" });
    }
  });

  router.get("/status-tv/:tvId", async (req, res) => {
    const { tvId } = req.params;

    try {
      const tv = await Tv.findById(tvId).select("status vimeoStatus plutoStatus");
      if (!tv) return res.status(404).json({ error: "TV não encontrada" });

      res.status(200).json({
        status: tv.status,
        vimeoStatus: tv.vimeoStatus,
        plutoStatus: tv.plutoStatus,
      });
    } catch (err) {
      res.status(500).json({ error: "Erro ao buscar status da TV" });
    }
  });

  router.get("/status-vimeo/:tvId", async (req, res) => {
    const { tvId } = req.params;

    try {
      const tv = await Tv.findById(tvId).select("vimeoStatus");
      if (!tv) return res.status(404).json({ error: "TV não encontrada" });

      res.status(200).json({ status: tv.vimeoStatus });
    } catch (err) {
      res.status(500).json({ error: "Erro ao buscar status do Vimeo" });
    }
  });

  router.get("/status-pluto/:tvId", async (req, res) => {
    const { tvId } = req.params;

    try {
      const tv = await Tv.findById(tvId).select("plutoStatus");
      if (!tv) return res.status(404).json({ error: "TV não encontrada" });

      res.status(200).json({ status: tv.plutoStatus });
    } catch (err) {
      res.status(500).json({ error: "Erro ao buscar status do Pluto" });
    }
  });

  return router;
};