const mongoose = require("mongoose");

const TvSchema = new mongoose.Schema(
  {
    youtubeLink: {
      type: String,
      validate: {
        validator: function (v) {
          return !v || /^https?:\/\/(www\.)?youtube\.com\/watch\?v=/.test(v);
        },
        message: "YouTube link inválido",
      },
    },
    vimeoLink: {
      type: String,
      validate: {
        validator: function (v) {
          return !v || /^https?:\/\/(www\.)?vimeo\.com\/\d+/.test(v);
        },
        message: "Vimeo link inválido",
      },
    },
    address: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, default: "ativo" },
    youtubeStatus: { type: String, default: "rodando" },
    vimeoStatus: { type: String, default: "rodando" },
    lastUpdate: { type: Date, default: Date.now },
    adType: { type: String, enum: ["full", "withTv"], default: "full" }, // Adicionado o campo adType
  },
  { timestamps: true }
);

// Garantir que pelo menos um dos links seja informado
TvSchema.pre("save", function (next) {
  if (!this.youtubeLink && !this.vimeoLink) {
    return next(
      new Error("É necessário fornecer pelo menos um link (YouTube ou Vimeo).")
    );
  }
  next();
});

module.exports = mongoose.model("Tv", TvSchema);
