const mongoose = require('mongoose');

const TvSchema = new mongoose.Schema({
  youtubeLink1: { 
    type: String, 
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)/.test(v);
      },
      message: "YouTube link inválido"
    }
  },
  youtubeLink2: { 
    type: String, 
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)/.test(v);
      },
      message: "YouTube link inválido"
    }
  },
  address: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, default: "ativo" }
}, { timestamps: true });

// Garantir que pelo menos um dos links seja informado
TvSchema.pre("save", function(next) {
  if (!this.youtubeLink1 && !this.youtubeLink2) {
    return next(new Error("É necessário fornecer pelo menos um link do YouTube."));
  }
  next();
});

module.exports = mongoose.model('Tv', TvSchema);
