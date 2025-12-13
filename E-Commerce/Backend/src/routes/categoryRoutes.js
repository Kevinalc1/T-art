const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware.js'); // Corrigido para corresponder a outros arquivos
const mongoose = require('mongoose');
const Category = mongoose.model('Category');

// @route   GET /api/categorias
// @desc    Busca todas as categorias
// @access  Público
router.get('/', async (req, res) => {
  try {
    const categorias = await Category.find().sort({ name: 1 }); // Ordena por nome
    res.json(categorias);
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor ao buscar categorias.' });
  }
});

// @route   POST /api/categorias
// @desc    Cria uma nova categoria
// @access  Privado/Admin
router.post('/', protect, admin, async (req, res) => { // A rota está protegida e restrita para admin
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'O nome da categoria é obrigatório.' });
    }
    const novaCategoria = new Category({ name });
    const categoriaSalva = await novaCategoria.save();
    res.status(201).json(categoriaSalva); // Retorna a categoria criada
  } catch (error) {
    // Log detalhado do erro no console do servidor para depuração
    console.error('ERRO DETALHADO AO CRIAR CATEGORIA:', error);

    // Trata o erro de nome duplicado
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Esta categoria já existe.' });
    }

    // Trata erros de validação do Mongoose (ex: nome muito curto, etc.)
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }

    // Para todos os outros tipos de erro, retorna um erro 500 genérico.
    // A mensagem específica do erro já foi logada no console para depuração.
    res.status(500).json({
      message: 'Ocorreu um erro interno no servidor ao tentar criar a categoria.'
    });
  }
}); // Fim do router.post

// @route   PUT /api/categorias/:id
// @desc    Atualiza uma categoria existente
// @access  Privado/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'O nome da categoria é obrigatório.' });
    }

    const category = await Category.findById(req.params.id);

    if (category) {
      category.name = name;
      const updatedCategory = await category.save();
      res.json(updatedCategory);
    } else {
      res.status(404).json({ message: 'Categoria não encontrada' });
    }
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Já existe uma categoria com este nome.' });
    } else {
      res.status(500).json({ message: 'Erro ao atualizar categoria' });
    }
  }
});

// @route   DELETE /api/categorias/:id
// @desc    Remove uma categoria
// @access  Privado/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (category) {
      await category.deleteOne(); // ou category.remove() dependendo da versão do Mongoose
      res.json({ message: 'Categoria removida' });
    } else {
      res.status(404).json({ message: 'Categoria não encontrada' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erro ao remover categoria' });
  }
});

module.exports = router;
