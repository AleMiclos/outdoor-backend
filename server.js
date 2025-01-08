const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();

// Configure o CORS para permitir múltiplas origens
const corsOptions = {
  origin: ["http://localhost:3000", "http://127.0.0.1:5500"],
  methods: "GET,POST,DELETE",
  allowedHeaders: "Content-Type,Authorization",
};

app.use(cors(corsOptions)); // Use o CORS com as opções configuradas
app.use(express.json());

// Importação das rotas
const authRoutes = require("./routes/auth");
const totemRoutes = require("./routes/totems");

// Uso das rotas
app.use("/auth", authRoutes);
app.use("/totems", totemRoutes);

app.use("/", totemRoutes);



// Conexão ao banco
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Conectado ao MongoDB com sucesso!"))
  .catch((err) => console.error("Erro ao conectar ao MongoDB:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
