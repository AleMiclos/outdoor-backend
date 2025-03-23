const express = require('express');
const router = express.Router();
const Tv = require('../models/TvModel');
const authenticateToken = require("../middleware/authenticateToken");

// Exportar uma função que recebe o WebSocket Server (wss)
module.exports = (wss) => {
  // Criar uma nova TV
  router.post('/', authenticateToken, async (req, res) => {
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
 // Atualizar uma TV pelo ID
router.put("/:tvId", authenticateToken, async (req, res) => {
  try {
      const { youtubeLink, vimeoLink, address, status } = req.body;
      const tvId = req.params.tvId;

      if (!youtubeLink && !vimeoLink) {
          return res.status(400).json({ message: "Forneça pelo menos um link (YouTube ou Vimeo)." });
      }

      const updatedTv = await Tv.findByIdAndUpdate(
          tvId,
          { youtubeLink, vimeoLink, address, status },
          { new: true, runValidators: true }
      );

      if (!updatedTv) {
          return res.status(404).json({ message: "TV não encontrada" });
      }

      // Enviar evento WebSocket apenas para os clientes que assistem essa TV específica
      wss.clients.forEach((client) => {
          if (client.readyState === 1) {
              client.send(JSON.stringify({
                  type: "tvUpdate",
                  tvId: updatedTv._id, // Enviar ID da TV específica
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

      if (!deletedTv) {
        return res.status(404).json({ message: "TV não encontrada" });
      }

      res.status(200).json({ message: "TV deletada com sucesso" });
    } catch (error) {
      res.status(500).json({ message: "Erro ao deletar TV", error: error.message });
    }
  });



  // Obtém o último `lastUpdate` de uma TV
  router.get('/status-tv', async (req, res) => {
    try {
      const latestTv = await Tv.findOne().sort({ lastUpdate: -1 }).select('lastUpdate');

      if (!latestTv) {
        return res.status(404).json({ error: 'Nenhuma TV encontrada' });
      }

      res.status(200).json({ lastUpdate: latestTv.lastUpdate });
    } catch (err) {
      console.error('Erro ao buscar `lastUpdate`:', err);
      res.status(500).json({ error: 'Erro ao buscar atualização da TV' });
    }
  });

  // Função para enviar o evento WebSocket de atualização de status
function broadcastTvStatus(updatedTv) {
  if (!updatedTv) return;

  const payload = {
    type: "statusUpdate",
    tvId: updatedTv._id,
    status: updatedTv.status,
    vimeoStatus: updatedTv.vimeoStatus,
    youtubeStatus: updatedTv.youtubeStatus,
    lastUpdate: updatedTv.lastUpdate,
  };

  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(payload));
    }
  });

  console.log("🔄 Status atualizado enviado via WebSocket:", payload);
}

// 🔹 Atualiza o status da TV
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

    if (!updatedTv) {
      return res.status(404).json({ error: "TV não encontrada" });
    }

    broadcastTvStatus(updatedTv); // 🔹 Chama a função otimizada para WebSocket

    res.status(200).json({ message: "Status da TV atualizado", tv: updatedTv });
  } catch (err) {
    console.error("Erro ao atualizar status da TV:", err);
    res.status(500).json({ error: "Erro ao atualizar status da TV" });
  }
});

// 🔹 Atualiza o status do Vimeo
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

    if (!updatedTv) {
      return res.status(404).json({ error: "TV não encontrada" });
    }

    broadcastTvStatus(updatedTv); // 🔹 Envia o evento WebSocket

    res.status(200).json({ message: "Status do Vimeo atualizado", tv: updatedTv });
  } catch (err) {
    console.error("Erro ao atualizar status do Vimeo:", err);
    res.status(500).json({ error: "Erro ao atualizar status do Vimeo" });
  }
});

// 🔹 Atualiza o status do YouTube
router.post("/status-youtube", async (req, res) => {
  const { tvId, status } = req.body;

  if (!tvId || status === undefined) {
    return res.status(400).json({ error: "tvId e status são obrigatórios" });
  }

  try {
    const updatedTv = await Tv.findByIdAndUpdate(
      tvId,
      { youtubeStatus: status, lastUpdate: Date.now() },
      { new: true }
    );

    if (!updatedTv) {
      return res.status(404).json({ error: "TV não encontrada" });
    }

    broadcastTvStatus(updatedTv); // 🔹 Envia o evento WebSocket

    res.status(200).json({ message: "Status do YouTube atualizado", tv: updatedTv });
  } catch (err) {
    console.error("Erro ao atualizar status do YouTube:", err);
    res.status(500).json({ error: "Erro ao atualizar status do YouTube" });
  }
});

// 🔹 Obtém o status da TV pelo ID
router.get("/status-tv/:tvId", async (req, res) => {
  const { tvId } = req.params;

  if (!tvId) {
    return res.status(400).json({ error: "tvId é obrigatório" });
  }

  try {
    const tv = await Tv.findById(tvId).select("status vimeoStatus youtubeStatus");

    if (!tv) {
      return res.status(404).json({ error: "TV não encontrada" });
    }

    console.log("Status da TV encontrado:", tv);
    res.status(200).json({
      status: tv.status,
      vimeoStatus: tv.vimeoStatus,
      youtubeStatus: tv.youtubeStatus,
    });
  } catch (err) {
    console.error("Erro ao buscar status da TV:", err);
    res.status(500).json({ error: "Erro ao buscar status da TV" });
  }
});

// 🔹 Obtém o status do Vimeo pelo ID da TV
router.get("/status-vimeo/:tvId", async (req, res) => {
  const { tvId } = req.params;

  if (!tvId) {
    return res.status(400).json({ error: "tvId é obrigatório" });
  }

  try {
    const tv = await Tv.findById(tvId).select("vimeoStatus");

    if (!tv) {
      return res.status(404).json({ error: "TV não encontrada" });
    }

    console.log("Status do Vimeo encontrado:", tv);
    res.status(200).json({ status: tv.vimeoStatus });
  } catch (err) {
    console.error("Erro ao buscar status do Vimeo:", err);
    res.status(500).json({ error: "Erro ao buscar status do Vimeo" });
  }
});

// 🔹 Obtém o status do YouTube pelo ID da TV
router.get("/status-youtube/:tvId", async (req, res) => {
  const { tvId } = req.params;

  if (!tvId) {
    return res.status(400).json({ error: "tvId é obrigatório" });
  }

  try {
    const tv = await Tv.findById(tvId).select("youtubeStatus");

    if (!tv) {
      return res.status(404).json({ error: "TV não encontrada" });
    }

    console.log("Status do YouTube encontrado:", tv);
    res.status(200).json({ status: tv.youtubeStatus });
  } catch (err) {
    console.error("Erro ao buscar status do YouTube:", err);
    res.status(500).json({ error: "Erro ao buscar status do YouTube" });
  }
});


  return router;
};