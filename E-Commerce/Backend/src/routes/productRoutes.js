const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware.js');
const mongoose = require('mongoose');
const Produto = mongoose.model('Produto');

// @desc    Buscar todos os produtos
// @route   GET /api/produtos
// @access  Public
router.get('/', async (req, res) => {
  try {
    const produtos = await Produto.find({}).populate('category', 'name');
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
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Produto não encontrado (ID inválido)' });
    }

    const produto = await Produto.findById(req.params.id)
      .populate('category', 'name')
      .populate('comboProducts');
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
router.post('/', protect, admin, async (req, res) => {
  try {
    const {
      productName,
      description,
      price,
      imageUrls,
      downloadUrl,
      isCombo,
      comboProducts,
      category,
    } = req.body;

    if (!category || category === '' || category === 'null') {
      return res.status(400).json({
        message: 'Por favor, selecione uma categoria para o produto. Crie uma categoria primeiro se necessário.'
      });
    }

    if (isCombo === false && !downloadUrl) {
      return res.status(400).json({
        message: 'O campo "Ficheiro da Arte (Download)" é obrigatório para produtos que não são combos.'
      });
    }

    const novoProduto = new Produto({
      productName,
      description,
      price,
      imageUrls,
      downloadUrl,
      isCombo,
      comboProducts,
      category,
    });
    await novoProduto.save();
    res.status(201).json(novoProduto);
  } catch (error) {
    console.error('Erro ao criar produto:', error);

    if (error.name === 'ValidationError' && error.errors?.category) {
      return res.status(400).json({
        message: 'Por favor, selecione uma categoria válida para o produto.'
      });
    }

    res.status(400).json({
      message: error.message || 'Erro ao criar produto'
    });
  }
});

// @desc    Atualizar um produto
// @route   PUT /api/produtos/:id
// @access  Private
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const { id } = req.params;
    const { isCombo, downloadUrl, category } = req.body;

    if (category !== undefined && (!category || category === '' || category === 'null')) {
      return res.status(400).json({
        message: 'Por favor, selecione uma categoria para o produto.'
      });
    }

    if (isCombo === false && !downloadUrl) {
      return res.status(400).json({
        message: 'O campo "Ficheiro da Arte (Download)" é obrigatório para produtos que não são combos.'
      });
    }

    const produtoAtualizado = await Produto.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!produtoAtualizado) {
      return res.status(404).json({ message: 'Produto não encontrado para atualizar' });
    }
    res.json(produtoAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);

    if (error.name === 'ValidationError' && error.errors?.category) {
      return res.status(400).json({
        message: 'Por favor, selecione uma categoria válida para o produto.'
      });
    }

    res.status(400).json({
      message: error.message || 'Erro ao atualizar produto'
    });
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