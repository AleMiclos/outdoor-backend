const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'cliente'], default: 'cliente' },
  totemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Totem', default: null }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
