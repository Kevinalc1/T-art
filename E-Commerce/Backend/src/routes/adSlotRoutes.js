const express = require('express');
const router = express.Router();
const AdSlot = require('../models/AdSlot');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Listar todos os ad slots
// @route   GET /api/ad-slots
// @access  Public
router.get('/', async (req, res) => {
    try {
        const slots = await AdSlot.find().sort({ position: 1, priority: -1 });
        res.json(slots);
    } catch (error) {
        console.error('Erro ao buscar ad slots:', error);
        res.status(500).json({ error: 'Erro ao buscar ad slots' });
    }
});

// @desc    Listar apenas ad slots ativos
// @route   GET /api/ad-slots/active
// @access  Public
router.get('/active', async (req, res) => {
    try {
        const { position } = req.query;

        const filter = { isActive: true };
        if (position) {
            filter.position = position;
        }

        const slots = await AdSlot.find(filter).sort({ priority: -1 });
        res.json(slots);
    } catch (error) {
        console.error('Erro ao buscar ad slots ativos:', error);
        res.status(500).json({ error: 'Erro ao buscar ad slots ativos' });
    }
});

// @desc    Atualizar ad slot
// @route   PUT /api/ad-slots/:id
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
    try {
        const { isActive, dimensions, priority, settings, description } = req.body;

        const slot = await AdSlot.findById(req.params.id);

        if (!slot) {
            return res.status(404).json({ error: 'Ad slot não encontrado' });
        }

        // Atualizar apenas campos permitidos
        if (typeof isActive !== 'undefined') slot.isActive = isActive;
        if (dimensions) slot.dimensions = { ...slot.dimensions, ...dimensions };
        if (typeof priority !== 'undefined') slot.priority = priority;
        if (settings) slot.settings = { ...slot.settings, ...settings };
        if (description) slot.description = description;

        await slot.save();

        res.json(slot);
    } catch (error) {
        console.error('Erro ao atualizar ad slot:', error);
        res.status(500).json({ error: 'Erro ao atualizar ad slot' });
    }
});

// @desc    Popular ad slots iniciais
// @route   POST /api/ad-slots/seed
// @access  Private/Admin
router.post('/seed', protect, admin, async (req, res) => {
    try {
        // Verificar se já existem slots
        const existingSlots = await AdSlot.countDocuments();
        if (existingSlots > 0) {
            return res.status(400).json({ error: 'Ad slots já foram populados' });
        }

        const initialSlots = [
            {
                name: 'Header Top Banner',
                position: 'header',
                description: 'Banner no topo do cabeçalho',
                dimensions: { width: '100%', height: '90px' },
                priority: 10,
                isActive: false,
            },
            {
                name: 'Sidebar Ad',
                position: 'sidebar',
                description: 'Anúncio na barra lateral',
                dimensions: { width: '300px', height: '250px' },
                priority: 5,
                isActive: false,
            },
            {
                name: 'In-Content Banner',
                position: 'in-content',
                description: 'Banner dentro do conteúdo',
                dimensions: { width: '100%', height: '200px' },
                priority: 7,
                isActive: false,
            },
            {
                name: 'Footer Banner',
                position: 'footer',
                description: 'Banner no rodapé',
                dimensions: { width: '100%', height: '100px' },
                priority: 3,
                isActive: false,
            },
        ];

        const slots = await AdSlot.insertMany(initialSlots);

        res.status(201).json({ message: 'Ad slots populados com sucesso', slots });
    } catch (error) {
        console.error('Erro ao popular ad slots:', error);
        res.status(500).json({ error: 'Erro ao popular ad slots' });
    }
});

module.exports = router;
