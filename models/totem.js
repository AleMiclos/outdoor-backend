const mongoose = require('mongoose');

const TotemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  videoUrl: { type: String, required: false },  // Não obrigatório
  description: { type: String, required: false },  // Não obrigatório
  title: { type: String, required: false },  // Não obrigatório
  idCliente: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

module.exports = mongoose.model('Totem', TotemSchema);
