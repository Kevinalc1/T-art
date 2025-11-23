const mongoose = require('mongoose');

const colecaoSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
    },
    coverImage: {
      type: String,
      required: true,
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Produto',
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Colecao', colecaoSchema);