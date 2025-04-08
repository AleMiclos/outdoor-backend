const mongoose = require("mongoose");

const TvSchema = new mongoose.Schema(
  {
    vimeoLink: {
      type: String,
      validate: {
        validator: function (v) {
          return !v || /^https?:\/\/(www\.)?vimeo\.com\/\d+/.test(v);
        },
        message: "Vimeo link inválido",
      },
    },
    plutoLink: {
      type: String,
      validate: {
        validator: function (v) {
          return (
            !v ||
            /^https?:\/\/pluto\.tv\/(br\/)?live-tv\/[a-zA-Z0-9]+(\?.*)?$/.test(v)
          );
        },
        message: "PlutoTV link inválido",
      },
    },
    
    address: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, default: "ativo" },
    vimeoStatus: { type: String, default: "rodando" },
    plutoStatus: { type: String, default: "rodando" },
    lastUpdate: { type: Date, default: Date.now },
    adType: { type: String, enum: ["full", "withTv"], default: "full" },
  },
  { timestamps: true }
);

// Garantir que pelo menos um dos links seja informado (Vimeo ou PlutoTV)
TvSchema.pre("save", function (next) {
  if (!this.vimeoLink && !this.plutoLink) {
    return next(
      new Error("É necessário fornecer pelo menos um link (Vimeo ou PlutoTV).")
    );
  }
  next();
});

module.exports = mongoose.model("Tv", TvSchema);