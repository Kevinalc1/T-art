const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware.js');
const mongoose = require('mongoose');
const Produto = require('../models/Produto.js');

// @desc    Buscar todos os produtos
// @route   GET /api/produtos
// @access  Public
router.get('/', async (req, res) => {
  try {
    const produtos = await Produto.find();
    res.json(produtos);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar produtos', error });
  }
});

// @desc    Buscar um produto por ID
// @route   GET /api/produtos/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    // Adiciona uma verificação para ver se o ID é um ObjectId válido do MongoDB
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Produto não encontrado (ID inválido)' });
    }

    const produto = await Produto.findById(req.params.id).populate('comboProducts');
    if (!produto) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }
    res.json(produto);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar o produto', error });
  }
});

// @desc    Criar um novo produto
// @route   POST /api/produtos
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    // Atualizado para incluir todos os campos possíveis do formulário
    const {
      productName,
      description,
      price,
      imageUrls,
      downloadUrl,
      isCombo,
      comboProducts,
    } = req.body;
    const novoProduto = new Produto({
      productName,
      description,
      price,
      imageUrls,
      downloadUrl,
      isCombo,
      comboProducts,
    });
    await novoProduto.save();
    res.status(201).json(novoProduto);
  } catch (error) {
    res.status(400).json({ message: 'Erro ao criar produto', error });
  }
});

// @desc    Atualizar um produto
// @route   PUT /api/produtos/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const produtoAtualizado = await Produto.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!produtoAtualizado) {
      return res.status(404).json({ message: 'Produto não encontrado para atualizar' });
    }
    res.json(produtoAtualizado);
  } catch (error) {
    res.status(400).json({ message: 'Erro ao atualizar produto', error });
  }
});

// @desc    Apagar um produto
// @route   DELETE /api/produtos/:id
// @access  Private
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const { id } = req.params;
    const produtoApagado = await Produto.findByIdAndDelete(id);
    if (!produtoApagado) {
      return res.status(404).json({ message: 'Produto não encontrado para apagar' });
    }
    res.json({ message: 'Produto apagado com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao apagar produto', error });
  }
});

module.exports = router;