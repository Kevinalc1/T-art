const mongoose = require('mongoose');

const adSlotSchema = new mongoose.Schema(
    {
        // Nome identificador do slot
        name: {
            type: String,
            required: true,
            unique: true,
        },

        // Posição do slot no layout
        position: {
            type: String,
            enum: ['header', 'sidebar', 'in-content', 'footer'],
            required: true,
        },

        // Status do slot (ativo/inativo)
        isActive: {
            type: Boolean,
            default: false,
        },

        // Descrição do slot
        description: {
            type: String,
        },

        // Dimensões sugeridas
        dimensions: {
            width: { type: String, default: '100%' },
            height: { type: String, default: 'auto' },
        },

        // Prioridade de exibição (maior = mais importante)
        priority: {
            type: Number,
            default: 0,
        },

        // Configurações adicionais (JSON flexível)
        settings: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
    },
    { timestamps: true }
);

// Índice para buscar slots ativos rapidamente
adSlotSchema.index({ isActive: 1, position: 1 });

module.exports = mongoose.model('AdSlot', adSlotSchema);
