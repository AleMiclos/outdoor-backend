const mongoose = require('mongoose');

const totemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  videoUrl: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isOnline: { type: Boolean, default: false },
  address: { type: String, required: true },
});

module.exports = mongoose.model('Totem', totemSchema);
