const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const Banner = require('../models/Banner');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Fetch all active banners (public)
// @route   GET /api/banners
// @access  Public
router.get('/', asyncHandler(async (req, res) => {
    const { position } = req.query;
    const query = { active: true };

    if (position) {
        query.position = position;
    }

    // Filter by date if applicable
    const now = new Date();
    query.$and = [
        { $or: [{ startDate: { $lte: now } }, { startDate: null }] },
        { $or: [{ endDate: { $gte: now } }, { endDate: null }] }
    ];

    const banners = await Banner.find(query).sort({ createdAt: -1 });
    res.json(banners);
}));

// @desc    Fetch all banners (admin)
// @route   GET /api/banners/admin
// @access  Private/Admin
router.get('/admin', protect, admin, asyncHandler(async (req, res) => {
    const banners = await Banner.find({}).sort({ createdAt: -1 });
    res.json(banners);
}));

// @desc    Create a banner
// @route   POST /api/banners
// @access  Private/Admin
router.post('/', protect, admin, asyncHandler(async (req, res) => {
    const { title, imageUrl, linkUrl, position, active, startDate, endDate } = req.body;

    const banner = new Banner({
        title,
        imageUrl,
        linkUrl,
        position,
        active,
        startDate,
        endDate
    });

    const createdBanner = await banner.save();
    res.status(201).json(createdBanner);
}));

// @desc    Update a banner
// @route   PUT /api/banners/:id
// @access  Private/Admin
router.put('/:id', protect, admin, asyncHandler(async (req, res) => {
    const { title, imageUrl, linkUrl, position, active, startDate, endDate } = req.body;
    const banner = await Banner.findById(req.params.id);

    if (banner) {
        banner.title = title || banner.title;
        banner.imageUrl = imageUrl || banner.imageUrl;
        banner.linkUrl = linkUrl || banner.linkUrl;
        banner.position = position || banner.position;
        banner.active = active !== undefined ? active : banner.active;
        banner.startDate = startDate || banner.startDate;
        banner.endDate = endDate !== undefined ? endDate : banner.endDate;

        const updatedBanner = await banner.save();
        res.json(updatedBanner);
    } else {
        res.status(404);
        throw new Error('Banner not found');
    }
}));

// @desc    Delete a banner
// @route   DELETE /api/banners/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, asyncHandler(async (req, res) => {
    const banner = await Banner.findById(req.params.id);

    if (banner) {
        await banner.deleteOne();
        res.json({ message: 'Banner removed' });
    } else {
        res.status(404);
        throw new Error('Banner not found');
    }
}));

module.exports = router;
