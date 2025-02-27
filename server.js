const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require('body-parser');

dotenv.config();

const app = express();

// Configure o CORS para permitir múltiplas origens
const corsOptions = {
  origin: ["http://localhost:4200", "https://all-door-frontend.vercel.app", "https://alldoor-frontend.vercel.app",  ],
  methods: "GET,POST,DELETE, PUT",
  allowedHeaders: "Content-Type,Authorization",
};

app.use(cors(corsOptions)); // Use o CORS com as opções configuradas
app.use(express.json());
app.use(bodyParser.json()); 

// Certifique-se de usar o middleware body-parser corretamente// Importação das rotas
const authRoutes = require("./routes/auth");
const totemRoutes = require("./routes/totem");
const userRoutes = require('./routes/users');
const tvRoutes = require('./routes/tvRoutes');

// Uso das rotas

app.use("/auth", authRoutes);
app.use("/totem", totemRoutes);
app.use("/users", userRoutes);
app.use("/tv", tvRoutes);

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
