const express = require('express');
const router = express.Router();
const TransactionLog = require('../models/TransactionLog');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Listar todos os logs de transação com filtros
// @route   GET /api/transaction-logs
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
    try {
        const { type, userEmail, startDate, endDate, page = 1, limit = 50 } = req.query;

        // Construir filtro
        const filter = {};

        if (type) {
            filter.type = type;
        }

        if (userEmail) {
            filter.userEmail = { $regex: userEmail, $options: 'i' };
        }

        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) {
                filter.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                filter.createdAt.$lte = new Date(endDate);
            }
        }

        // Paginação
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Buscar logs
        const logs = await TransactionLog.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('orderId', 'stripeSessionId totalPrice');

        // Contar total
        const total = await TransactionLog.countDocuments(filter);

        res.json({
            logs,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (error) {
        console.error('Erro ao buscar logs de transação:', error);
        res.status(500).json({ error: 'Erro ao buscar logs de transação' });
    }
});

// @desc    Obter estatísticas financeiras
// @route   GET /api/transaction-logs/stats
// @access  Private/Admin
router.get('/stats', protect, admin, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        // Construir filtro de data
        const dateFilter = {};
        if (startDate || endDate) {
            dateFilter.createdAt = {};
            if (startDate) {
                dateFilter.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                dateFilter.createdAt.$lte = new Date(endDate);
            }
        }

        // Agregar estatísticas por tipo
        const stats = await TransactionLog.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: '$type',
                    total: { $sum: '$amount' },
                    count: { $sum: 1 },
                },
            },
        ]);

        // Calcular totais gerais
        const totalIncome = stats
            .filter(s => s._id === 'PAYMENT' || s._id === 'CREDIT')
            .reduce((sum, s) => sum + s.total, 0);

        const totalOutcome = stats
            .filter(s => s._id === 'REFUND' || s._id === 'COMMISSION')
            .reduce((sum, s) => sum + s.total, 0);

        const netBalance = totalIncome - totalOutcome;

        res.json({
            stats,
            summary: {
                totalIncome,
                totalOutcome,
                netBalance,
            },
        });
    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }
});

// @desc    Exportar logs para CSV
// @route   GET /api/transaction-logs/export
// @access  Private/Admin
router.get('/export', protect, admin, async (req, res) => {
    try {
        const { type, userEmail, startDate, endDate } = req.query;

        // Construir filtro
        const filter = {};

        if (type) {
            filter.type = type;
        }

        if (userEmail) {
            filter.userEmail = { $regex: userEmail, $options: 'i' };
        }

        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) {
                filter.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                filter.createdAt.$lte = new Date(endDate);
            }
        }

        // Buscar todos os logs (sem paginação para export)
        const logs = await TransactionLog.find(filter)
            .sort({ createdAt: -1 })
            .populate('orderId', 'stripeSessionId totalPrice');

        // Criar CSV
        const csvHeader = 'Data,Tipo,Valor,Moeda,Email,Método,Status,Descrição,Stripe Session ID\n';
        const csvRows = logs.map(log => {
            return [
                new Date(log.createdAt).toLocaleString('pt-BR'),
                log.type,
                log.amount.toFixed(2),
                log.currency,
                log.userEmail,
                log.paymentMethod || 'N/A',
                log.status,
                `"${log.description || 'N/A'}"`,
                log.stripeSessionId || 'N/A',
            ].join(',');
        }).join('\n');

        const csv = csvHeader + csvRows;

        // Enviar CSV
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=transaction-logs-${Date.now()}.csv`);
        res.send(csv);
    } catch (error) {
        console.error('Erro ao exportar logs:', error);
        res.status(500).json({ error: 'Erro ao exportar logs' });
    }
});

// @desc    Criar log de transação manual (para créditos/ajustes)
// @route   POST /api/transaction-logs
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
    try {
        const { type, amount, userEmail, description, metadata } = req.body;

        // Validação
        if (!type || !amount || !userEmail) {
            return res.status(400).json({ error: 'Tipo, valor e email são obrigatórios' });
        }

        // Criar log
        const log = await TransactionLog.create({
            type,
            amount,
            userEmail,
            description,
            metadata,
            paymentMethod: 'manual',
            status: 'completed',
            createdBy: req.user.email,
        });

        res.status(201).json(log);
    } catch (error) {
        console.error('Erro ao criar log de transação:', error);
        res.status(500).json({ error: 'Erro ao criar log de transação' });
    }
});

module.exports = router;
