const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware.js');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Produto = mongoose.model('Produto');

// @desc    Obter wishlist do usuário
// @route   GET /api/wishlist
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('wishlist');

        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        res.json(user.wishlist || []);
    } catch (error) {
        console.error('Erro ao buscar wishlist:', error);
        res.status(500).json({ message: 'Erro ao buscar wishlist', error: error.message });
    }
});

// @desc    Adicionar produto à wishlist
// @route   POST /api/wishlist/:productId
// @access  Private
router.post('/:productId', protect, async (req, res) => {
    try {
        const { productId } = req.params;

        // Validar se o productId é válido
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: 'ID de produto inválido' });
        }

        // Verificar se o produto existe
        const produto = await Produto.findById(productId);
        if (!produto) {
            return res.status(404).json({ message: 'Produto não encontrado' });
        }

        // Buscar usuário
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        // Verificar se o produto já está na wishlist
        const alreadyInWishlist = user.wishlist.some(
            (id) => id.toString() === productId
        );

        if (alreadyInWishlist) {
            return res.status(400).json({ message: 'Produto já está na wishlist' });
        }

        // Adicionar à wishlist
        user.wishlist.push(productId);
        await user.save();

        // Retornar wishlist atualizada com produtos populados
        const updatedUser = await User.findById(req.user._id).populate('wishlist');
        res.status(201).json({
            message: 'Produto adicionado à wishlist',
            wishlist: updatedUser.wishlist
        });
    } catch (error) {
        console.error('Erro ao adicionar à wishlist:', error);
        res.status(500).json({ message: 'Erro ao adicionar à wishlist', error: error.message });
    }
});

// @desc    Remover produto da wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
router.delete('/:productId', protect, async (req, res) => {
    try {
        const { productId } = req.params;

        // Validar se o productId é válido
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: 'ID de produto inválido' });
        }

        // Buscar usuário
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        // Remover da wishlist
        user.wishlist = user.wishlist.filter(
            (id) => id.toString() !== productId
        );
        await user.save();

        // Retornar wishlist atualizada com produtos populados
        const updatedUser = await User.findById(req.user._id).populate('wishlist');
        res.json({
            message: 'Produto removido da wishlist',
            wishlist: updatedUser.wishlist
        });
    } catch (error) {
        console.error('Erro ao remover da wishlist:', error);
        res.status(500).json({ message: 'Erro ao remover da wishlist', error: error.message });
    }
});

module.exports = router;
