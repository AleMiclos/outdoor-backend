const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require('body-parser');
const WebSocket = require("ws");
const helmet = require("helmet");
const morgan = require("morgan");
const jwt = require("jsonwebtoken");

dotenv.config();

const app = express();

// Middlewares de segurança e logs
app.use(helmet());
app.use(morgan('combined'));

// Configuração do CORS
const corsOptions = {
  origin: ["http://localhost:4200", "https://alldoor.vercel.app", "https://alldoorteste.vercel.app", "https://alldoortestes.vercel.app"],
  methods: "GET,POST,DELETE,PUT",
  allowedHeaders: "Content-Type,Authorization",
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.json());

// Servidor HTTP
const server = require("http").createServer(app);

// Configuração do WebSocket
const wss = new WebSocket.Server({ server });
const clients = new Map();

wss.on("connection", (ws, req) => {
  const token = req.headers['sec-websocket-protocol'];

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        ws.close(4001, 'Token inválido');
        return;
      }

      console.log(`Cliente autenticado: ${user.id}`);
      clients.set(user.id, ws);
    });
  } else {
    console.log("Cliente conectado sem autenticação.");
  }

  // Configura um ping/pong para manter a conexão ativa
  ws.isAlive = true;
  ws.on('pong', () => {
    ws.isAlive = true;
  });

  ws.on('close', () => {
    clients.forEach((clientWs, userId) => {
      if (clientWs === ws) {
        clients.delete(userId);
        console.log(`Cliente ${userId} desconectado.`);
      }
    });
  });
});

// Verifica conexões ativas a cada 30 segundos
setInterval(() => {
  wss.clients.forEach((ws) => {
    if (!ws.isAlive) {
      return ws.terminate();
    }

    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

// Importação das rotas
const authRoutes = require("./routes/auth");
const totemRoutes = require("./routes/totem");
const userRoutes = require("./routes/users");
const tvRoutes = require("./routes/tvRoutes")(wss); // Passamos o WebSocket para tvRoutes

// Uso das rotas
app.use("/auth", authRoutes);
app.use("/totem", totemRoutes);
app.use("/users", userRoutes);
app.use("/tv", tvRoutes);

// Middleware de tratamento de erros global
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({ message: 'Erro interno do servidor' });
});

// Conexão ao MongoDB
const MONGO_URI = process.env.MONGO_URI;
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Conectado ao MongoDB"))
  .catch((error) => console.error("Erro ao conectar ao MongoDB:", error));

// Inicialização do servidor
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});