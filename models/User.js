const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  permissions: {
    totens: { type: Boolean, default: false }, // Permissão para Totens
    tvs: { type: Boolean, default: false } // Permissão para TVs
  },
  assignedTvs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tv' }] // TVs atribuídas ao usuário
});

module.exports = mongoose.model("User", userSchema);
