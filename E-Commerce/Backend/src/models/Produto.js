const mongoose = require('mongoose');

const produtoSchema = new mongoose.Schema({
  productName: {
    type: String,
    // required: true, // Removido para tornar opcional
  },
  description: {
    type: String,
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category', // Referência ao modelo de Categoria
  },
  imageUrls: {
    type: [String], // Define como um array de Strings
    required: true, // Garante que o array em si seja fornecido
  },
  downloadUrl: {
    type: String,
    // A validação será feita na rota para evitar complexidade no schema.
  },
  downloadUrls: {
    type: [String],
    default: [],
  },
  fontUrl: {
    type: String,
  },
  vectorUrl: {
    type: String,
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
  technicalSpecs: {
    dpi: { type: Number, default: 300 },
    format: { type: String, default: 'CMYK' },
    isVector: { type: Boolean, default: false }
  },
  version: { type: String, default: '1.0' },
  lastUpdated: { type: Date, default: Date.now }
},
  { timestamps: true } // Adiciona os campos createdAt e updatedAt automaticamente
);

module.exports = mongoose.model('Produto', produtoSchema);