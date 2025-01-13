const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  totemId: { type: String, default: null }, // Permite que totemId seja nulo
});


const User = mongoose.model('User', UserSchema);
module.exports = User;
