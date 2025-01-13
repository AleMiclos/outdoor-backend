const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Novo campo de nome obrigatório
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'cliente'], required: true },
  totemId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Totem',
    validate: {
      validator: function(value) {
        if (this.role === 'cliente' && !value) {
          return false; // Cliente sem totemId não é válido
        }
        return true;
      },
      message: 'Clientes devem ter um totemId.'
    }
  },
});

const User = mongoose.model('User', UserSchema);
module.exports = User;
