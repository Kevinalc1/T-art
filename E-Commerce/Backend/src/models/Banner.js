const mongoose = require('mongoose');

const bannerSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    imageUrl: {
        type: String,
        required: true,
    },
    linkUrl: {
        type: String,
        required: false,
    },
    position: {
        type: String,
        enum: ['hero', 'sidebar', 'footer'],
        default: 'hero',
    },
    active: {
        type: Boolean,
        default: true,
    },
    startDate: {
        type: Date,
        default: Date.now,
    },
    endDate: {
        type: Date,
    },
}, {
    timestamps: true,
});

const Banner = mongoose.model('Banner', bannerSchema);

module.exports = Banner;
