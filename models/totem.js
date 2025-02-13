const mongoose = require('mongoose');

const totemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  videoUrl: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v) {
        return /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|vimeo\.com\/\d+|drive\.google\.com\/file\/d\/)/.test(v);
      },
      message: "URL de vídeo inválida. Use um link válido do YouTube, Vimeo ou Google Drive."
    }
  },
  isActive: { type: Boolean, default: true },
  isOnline: { type: Boolean, default: false },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  address: { type: String, required: true }
}, { timestamps: true });

// Se o totem for desativado, garantir que ele também fique offline
totemSchema.pre("save", function(next) {
  if (!this.isActive) {
    this.isOnline = false;
  }
  next();
});

module.exports = mongoose.model('Totem', totemSchema);
