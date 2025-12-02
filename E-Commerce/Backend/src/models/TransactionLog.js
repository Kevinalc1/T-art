const mongoose = require('mongoose');

const transactionLogSchema = new mongoose.Schema(
    {
        // Tipo de transação
        type: {
            type: String,
            enum: ['PAYMENT', 'REFUND', 'COMMISSION', 'CREDIT'],
            required: true,
            immutable: true, // Não pode ser alterado após criação
        },

        // Valor da transação (sempre positivo, o tipo define se é entrada ou saída)
        amount: {
            type: Number,
            required: true,
            immutable: true,
        },

        // Moeda
        currency: {
            type: String,
            default: 'BRL',
            immutable: true,
        },

        // Referência ao pedido (se aplicável)
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Pedido',
            immutable: true,
        },

        // Email do usuário relacionado
        userEmail: {
            type: String,
            required: true,
            immutable: true,
        },

        // ID da sessão do Stripe (se aplicável)
        stripeSessionId: {
            type: String,
            immutable: true,
        },

        // ID da transação do Stripe (payment intent, refund, etc)
        stripeTransactionId: {
            type: String,
            immutable: true,
        },

        // Método de pagamento
        paymentMethod: {
            type: String,
            enum: ['card', 'pix', 'manual', 'other'],
            immutable: true,
        },

        // Status da transação
        status: {
            type: String,
            enum: ['pending', 'completed', 'failed', 'cancelled'],
            default: 'completed',
            immutable: true,
        },

        // Descrição da transação
        description: {
            type: String,
            immutable: true,
        },

        // Metadados adicionais (JSON flexível)
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            immutable: true,
        },

        // Quem criou o log (sistema ou admin)
        createdBy: {
            type: String,
            default: 'system',
            immutable: true,
        },
    },
    {
        timestamps: true, // Adiciona createdAt e updatedAt
        // Desabilita updates no documento inteiro
        strict: true,
    }
);

// Índices para melhorar performance de queries
transactionLogSchema.index({ type: 1, createdAt: -1 });
transactionLogSchema.index({ userEmail: 1, createdAt: -1 });
transactionLogSchema.index({ orderId: 1 });
transactionLogSchema.index({ stripeSessionId: 1 });

// Middleware para prevenir updates
transactionLogSchema.pre('findOneAndUpdate', function (next) {
    const error = new Error('Transaction logs are immutable and cannot be updated');
    next(error);
});

transactionLogSchema.pre('updateOne', function (next) {
    const error = new Error('Transaction logs are immutable and cannot be updated');
    next(error);
});

transactionLogSchema.pre('updateMany', function (next) {
    const error = new Error('Transaction logs are immutable and cannot be updated');
    next(error);
});

module.exports = mongoose.model('TransactionLog', transactionLogSchema);
