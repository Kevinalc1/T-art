const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = mongoose.model('User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Decodifica o token para obter o ID do usuário
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Busca o usuário no banco de dados pelo ID e anexa ao objeto 'req'
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error('Erro de autenticação:', error.message);
      return res.status(401).json({ message: 'Não autorizado, o token falhou.' });
    }
  } else {
    return res.status(401).json({ message: 'Não autorizado, nenhum token fornecido.' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    return res.status(401).json({ message: 'Não autorizado como administrador' });
  }
};

module.exports = { protect, admin };