const express = require('express');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const generateToken = require('../utils/generateToken.js');
const asyncHandler = require('express-async-handler');
const { protect } = require('../middleware/authMiddleware.js');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const router = express.Router();
const bcrypt = require('bcryptjs'); // Importa o bcryptjs

// @desc    Registrar um novo usuário
// @route   POST /api/auth/register
// @access  Public
router.post('/register', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('Usuário já existe');
  }

  // O hook 'pre-save' no modelo User.js irá criptografar a senha automaticamente
  const user = await User.create({
    email,
    password, // Passa a senha em texto puro, o modelo cuida da criptografia
    // Por padrão, um novo usuário não é admin
    isAdmin: false,
  });

  if (user) {
    res.status(201).json({
      token: generateToken(user._id),
      user: {
        _id: user._id,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } else {
    res.status(400);
    throw new Error('Dados de usuário inválidos');
  }
}));

// @desc    Autenticar usuário & obter token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      token: generateToken(user._id),
      user: {
        _id: user._id,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } else {
    res.status(401); // Unauthorized
    throw new Error('Email ou senha inválidos');
  }
}));

// @desc    Obter perfil do usuário
// @route   GET /api/auth/perfil
// @access  Private
router.get('/perfil', protect, asyncHandler(async (req, res) => {
  // O middleware 'protect' já validou o token e anexou o usuário ao 'req'
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error('Usuário não encontrado');
  }
}));

// @desc    Solicitar redefinição de senha
// @route   POST /api/auth/request-reset
// @access  Public
router.post('/request-reset', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    // Dica de segurança: Não revele se o e-mail existe.
    // Apenas enviamos o e-mail se o utilizador for encontrado.
    if (user) {
      // 1. Gerar o token
      const resetToken = crypto.randomBytes(20).toString('hex');
      // 2. Salvar o token e a data de expiração no utilizador
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpire = Date.now() + 3600000; // 1 hora
      await user.save();
      // 3. Criar o URL (para o NOSSO FRONTEND)
      const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
      // 4. Criar o corpo do e-mail
      const message = `
        <h1>Esqueceu-se da sua senha?</h1>
        <p>Recebemos um pedido de redefinição de senha para a sua conta.</p>
        <p>Clique no link abaixo para definir uma nova senha. Este link expira em 1 hora:</p>
        <a href="${resetUrl}" clicktracking=off>${resetUrl}</a>
        <p>Se não pediu isto, por favor, ignore este e-mail.</p>
      `;
      // 5. Enviar o e-mail
      await sendEmail({
        to: user.email,
        subject: 'Redefinição de Senha - Cristianoalc',
        html: message
      });
    }
    res.status(200).json({ message: 'Se o e-mail estiver registado, um link de redefinição foi enviado.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro do servidor' });
  }
});

// @desc    Executar a redefinição de senha
// @route   PUT /api/auth/reset-password/:token
// @access  Public
router.put('/reset-password/:token', async (req, res) => {
  try {
    // 1. Encontrar o utilizador pelo token E verificar se não expirou
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpire: { $gt: Date.now() } // $gt = "greater than" (maior que)
    });
    if (!user) {
      return res.status(400).json({ message: 'Token inválido ou expirado.' });
    }
    // 2. Criptografar a nova senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // 3. Definir a nova senha (já criptografada) e limpar os campos do token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    // 4. Salvar o usuário com a nova senha criptografada
    await user.save();
    res.status(200).json({ message: 'Senha redefinida com sucesso!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro do servidor' });
  }
});

module.exports = router;
