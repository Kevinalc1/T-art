const mongoose = require('mongoose');

const produtoSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
    },
    imageUrls: {
      type: [String], // Define como um array de Strings
      required: true, // Garante que o array em si seja fornecido
    },
    downloadUrl: {
      type: String,
      // Torna este campo obrigatório APENAS se 'isCombo' for falso.
      required: function () { 
        return !this.isCombo;
      },
    },
    isCombo: { 
      type: Boolean,
      default: false,
    },
    comboProducts: [ 
      { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Produto' 
      },
    ], 
  },
  { timestamps: true } // Adiciona os campos createdAt e updatedAt automaticamente
);

module.exports = mongoose.model('Produto', produtoSchema);