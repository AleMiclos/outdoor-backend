const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();

// Configure o CORS para permitir múltiplas origens
const corsOptions = {
  origin: ["http://localhost:3000", "https://painel-outdoor.vercel.app"],
  methods: "GET,POST,DELETE, PUT",
  allowedHeaders: "Content-Type,Authorization",
};

app.use(cors(corsOptions)); // Use o CORS com as opções configuradas
app.use(express.json());

// Importação das rotas
const authRoutes = require("./routes/auth");
const totemRoutes = require("./routes/totems");
const userRoutes = require('./routes/users');


// Uso das rotas
app.use("/auth", authRoutes);
app.use("/totems", totemRoutes);
app.use("/users", userRoutes);


// app.use("/", totemRoutes);


const MONGO_URI = process.env.MONGO_URI;

// Conexão ao banco
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Conectado ao MongoDB"))
  .catch((error) => console.error("Erro ao conectar ao MongoDB:", error));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
