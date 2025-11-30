const express = require('express');
const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const { protect } = require('../middleware/authMiddleware');

const User = mongoose.model('User');
const Pedido = mongoose.model('Pedido');
const Produto = mongoose.model('Produto');

const router = express.Router();

// @desc    Obter biblioteca de estampas (produtos comprados)
// @route   GET /api/users/library
// @access  Private
router.get('/library', protect, asyncHandler(async (req, res) => {
    // Busca todos os pedidos pagos do usuário
    const pedidos = await Pedido.find({ userEmail: req.user.email, isPaid: true });

    // Extrai os IDs dos produtos
    let productIds = [];
    pedidos.forEach(pedido => {
        pedido.items.forEach(item => {
            if (item.productId) {
                productIds.push(item.productId);
            }
        });
    });

    // Remove duplicatas
    productIds = [...new Set(productIds)];

    // Busca os detalhes dos produtos
    const products = await Produto.find({ _id: { $in: productIds } });

    res.json(products);
}));

// @desc    Obter coleções do usuário
// @route   GET /api/users/collections
// @access  Private
router.get('/collections', protect, asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate('collections.products');
    res.json(user.collections);
}));

// @desc    Criar nova coleção
// @route   POST /api/users/collections
// @access  Private
router.post('/collections', protect, asyncHandler(async (req, res) => {
    const { name } = req.body;

    if (!name) {
        res.status(400);
        throw new Error('Nome da coleção é obrigatório');
    }

    const user = await User.findById(req.user._id);

    const newCollection = {
        name,
        products: []
    };

    user.collections.push(newCollection);
    await user.save();

    res.status(201).json(user.collections);
}));

// @desc    Adicionar/Remover produto da coleção
// @route   PUT /api/users/collections/:id
// @access  Private
router.put('/collections/:id', protect, asyncHandler(async (req, res) => {
    const { productId, action } = req.body; // action: 'add' or 'remove'
    const collectionId = req.params.id;

    const user = await User.findById(req.user._id);
    const collection = user.collections.id(collectionId);

    if (!collection) {
        res.status(404);
        throw new Error('Coleção não encontrada');
    }

    if (action === 'add') {
        // Verifica se já existe
        if (!collection.products.includes(productId)) {
            collection.products.push(productId);
        }
    } else if (action === 'remove') {
        collection.products = collection.products.filter(id => id.toString() !== productId);
    }

    await user.save();

    // Re-popula para retornar os dados atualizados
    await user.populate('collections.products');

    res.json(user.collections);
}));

// @desc    Deletar coleção
// @route   DELETE /api/users/collections/:id
// @access  Private
router.delete('/collections/:id', protect, asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    user.collections = user.collections.filter(col => col._id.toString() !== req.params.id);

    await user.save();
    res.json(user.collections);
}));

// @desc    Registrar download
// @route   POST /api/users/downloads
// @access  Private
router.post('/downloads', protect, asyncHandler(async (req, res) => {
    const { productId, version } = req.body;

    const user = await User.findById(req.user._id);

    user.downloadHistory.push({
        product: productId,
        version: version || '1.0',
        downloadedAt: new Date()
    });

    await user.save();
    res.status(201).json({ message: 'Download registrado' });
}));

module.exports = router;
