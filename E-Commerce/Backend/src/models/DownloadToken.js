const mongoose = require('mongoose');

const downloadTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Produto',
        required: true
    },
    userEmail: {
        type: String,
        required: true
    },
    orderId: {
        type: String,
        required: true
    },
    downloadUrl: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    },
    used: {
        type: Boolean,
        default: false
    },
    usedAt: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Índice TTL para limpeza automática de tokens expirados após 7 dias
downloadTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 604800 });

const DownloadToken = mongoose.model('DownloadToken', downloadTokenSchema);

module.exports = DownloadToken;
