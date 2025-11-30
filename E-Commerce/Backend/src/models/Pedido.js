const mongoose = require('mongoose');

const pedidoSchema = new mongoose.Schema(
  {
    userEmail: {
      type: String,
      required: true,
    },
    items: [
      {
        productName: { type: String, required: true },
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Produto' }, // Referência para permitir atualizações
        price: { type: Number, required: true },
        quantidade: { type: Number, required: true },
        downloadUrl: { type: String, required: true },
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
    },
    stripeSessionId: {
      type: String,
      required: true,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: {
      type: Date,
    },
  },
  { timestamps: true } // Adiciona createdAt e updatedAt
);

module.exports = mongoose.model('Pedido', pedidoSchema);