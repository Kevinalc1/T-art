const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { protect, admin } = require('../middleware/authMiddleware.js');
const Pedido = mongoose.model('Pedido');

// @desc    Buscar os pedidos do usuário logado
// @route   GET /api/pedidos/meus-pedidos
// @access  Private
router.get('/meus-pedidos', protect, async (req, res) => {
  try {
    // req.user é populado pelo middleware 'protect' com os dados do usuário do token
    const pedidos = await Pedido.find({ userEmail: req.user.email }).sort({ createdAt: -1 });
    res.json(pedidos);
  } catch (error) {
    console.error('Erro ao buscar pedidos do usuário:', error);
    res.status(500).json({ message: 'Erro no servidor ao buscar pedidos.' });
  }
});

// @desc    Buscar TODOS os pedidos (Admin)
// @route   GET /api/pedidos/todos
// @access  Private/Admin
router.get('/todos', protect, admin, async (req, res) => {
  try {
    const pedidos = await Pedido.find({}).sort({ createdAt: -1 });
    res.json(pedidos);
  } catch (error) {
    console.error('Erro ao buscar todos os pedidos:', error);
    res.status(500).json({ message: 'Erro no servidor ao buscar pedidos.' });
  }
});

module.exports = router;