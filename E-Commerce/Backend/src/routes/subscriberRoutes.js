const express = require('express');
const router = express.Router();
const Subscriber = require('../models/Subscriber');

// POST /api/subscribers - Adicionar novo subscriber
router.post('/', async (req, res) => {
    try {
        const { email, name, source, incentive } = req.body;

        // Verificar se email já existe
        const existingSubscriber = await Subscriber.findOne({ email });

        if (existingSubscriber) {
            if (existingSubscriber.isActive) {
                return res.status(400).json({
                    error: 'Este e-mail já está cadastrado na nossa newsletter.'
                });
            } else {
                // Reativar subscriber
                existingSubscriber.isActive = true;
                existingSubscriber.subscribedAt = new Date();
                existingSubscriber.unsubscribedAt = null;
                await existingSubscriber.save();

                return res.status(200).json({
                    message: 'Bem-vindo de volta! Sua inscrição foi reativada.',
                    subscriber: existingSubscriber
                });
            }
        }

        // Criar novo subscriber
        const subscriber = new Subscriber({
            email,
            name: name || null,
            source: source || 'popup',
            incentive: incentive || null
        });

        await subscriber.save();

        res.status(201).json({
            message: 'Inscrição realizada com sucesso!',
            subscriber
        });

    } catch (error) {
        console.error('Erro ao criar subscriber:', error);

        if (error.code === 11000) {
            return res.status(400).json({ error: 'Este e-mail já está cadastrado.' });
        }

        res.status(500).json({ error: 'Erro ao processar inscrição.' });
    }
});

// GET /api/subscribers - Listar todos (apenas admin)
router.get('/', async (req, res) => {
    try {
        const subscribers = await Subscriber.find({ isActive: true })
            .sort({ subscribedAt: -1 });

        res.json(subscribers);
    } catch (error) {
        console.error('Erro ao buscar subscribers:', error);
        res.status(500).json({ error: 'Erro ao buscar inscritos.' });
    }
});

// DELETE /api/subscribers/:email - Cancelar inscrição
router.delete('/:email', async (req, res) => {
    try {
        const { email } = req.params;

        const subscriber = await Subscriber.findOne({ email });

        if (!subscriber) {
            return res.status(404).json({ error: 'E-mail não encontrado.' });
        }

        subscriber.isActive = false;
        subscriber.unsubscribedAt = new Date();
        await subscriber.save();

        res.json({ message: 'Inscrição cancelada com sucesso.' });
    } catch (error) {
        console.error('Erro ao cancelar inscrição:', error);
        res.status(500).json({ error: 'Erro ao cancelar inscrição.' });
    }
});

module.exports = router;
