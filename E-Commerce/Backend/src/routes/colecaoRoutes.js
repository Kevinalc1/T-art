const express = require('express');
const router = express.Router();
const Colecao = require('../models/Colecao');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Listar todas as coleções
// @route   GET /api/colecoes
// @access  Público
router.get('/', async (req, res) => {
  try {
    // Para a lista geral, não populamos os produtos para ser mais leve
    const colecoes = await Colecao.find({});
    res.json(colecoes);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar coleções', error });
  }
});

// @desc    Buscar detalhes de uma coleção por ID
// @route   GET /api/colecoes/:id
// @access  Público
router.get('/:id', async (req, res) => {
  try {
    // Aqui populamos os produtos para mostrar na página de detalhes
    const colecao = await Colecao.findById(req.params.id).populate('products');
    if (colecao) {
      res.json(colecao);
    } else {
      res.status(404).json({ message: 'Coleção não encontrada' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar a coleção', error });
  }
});

// @desc    Criar nova coleção
// @route   POST /api/colecoes
// @access  Privado/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const { name, description, coverImage, products } = req.body;
    const novaColecao = new Colecao({ name, description, coverImage, products });
    const colecaoCriada = await novaColecao.save();
    res.status(201).json(colecaoCriada);
  } catch (error) {
    res.status(400).json({ message: 'Erro ao criar coleção', error });
  }
});

// @desc    Atualizar uma coleção
// @route   PUT /api/colecoes/:id
// @access  Privado/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const colecaoAtualizada = await Colecao.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (colecaoAtualizada) {
      res.json(colecaoAtualizada);
    } else {
      res.status(404).json({ message: 'Coleção não encontrada para atualizar' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Erro ao atualizar coleção', error });
  }
});

// @desc    Apagar uma coleção
// @route   DELETE /api/colecoes/:id
// @access  Privado/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const colecaoApagada = await Colecao.findByIdAndDelete(req.params.id);
    if (colecaoApagada) {
      res.json({ message: 'Coleção apagada com sucesso' });
    } else {
      res.status(404).json({ message: 'Coleção não encontrada para apagar' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erro ao apagar coleção', error });
  }
});

module.exports = router;