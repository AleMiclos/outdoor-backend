const mongoose = require('mongoose');

const totemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  videoUrl: { type: String, required: true },
  isOnline: { type: Boolean, default: false }, // Novo campo para status online/offline
  address: { type: String, required: true }, // Novo campo para endereço do totem
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

module.exports = mongoose.model('Totem', totemSchema);

