const mongoose = require('mongoose');

const subscriberSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Email inválido']
    },
    name: {
        type: String,
        trim: true
    },
    source: {
        type: String,
        enum: ['popup', 'footer', 'checkout', 'manual'],
        default: 'popup'
    },
    incentive: {
        type: String, // Ex: "10% desconto", "5 artes grátis"
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    },
    subscribedAt: {
        type: Date,
        default: Date.now
    },
    unsubscribedAt: {
        type: Date,
        default: null
    },
    tags: [{
        type: String
    }]
}, {
    timestamps: true
});

// Index para busca rápida por email
subscriberSchema.index({ email: 1 });
subscriberSchema.index({ isActive: 1 });

module.exports = mongoose.model('Subscriber', subscriberSchema);
