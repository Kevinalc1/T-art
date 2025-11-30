const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: false, // Alterado para false para suportar login social
    },
    googleId: String,
    facebookId: String,
    appleId: String,
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    collections: [
      {
        name: { type: String, required: true },
        products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Produto' }],
        createdAt: { type: Date, default: Date.now }
      }
    ],
    downloadHistory: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Produto' },
        downloadedAt: { type: Date, default: Date.now },
        version: String
      }
    ]
  },
  {
    timestamps: true, // Adiciona createdAt e updatedAt automaticamente
  }
);

// Hook para fazer o hash da senha antes de salvar
userSchema.pre('save', async function (next) {
  // Só faz o hash se a senha foi modificada (ou é nova)
  if (!this.isModified('password')) {
    return next();
  }

  // Se a senha não existir (login social), não faz hash
  if (!this.password) {
    return next();
  }

  const salt = await bcryptjs.genSalt(10);
  this.password = await bcryptjs.hash(this.password, salt);
});

// Método para comparar a senha digitada com o hash no banco de dados
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcryptjs.compare(enteredPassword, this.password);
};

// Método para obter lista de provedores OAuth vinculados
userSchema.methods.getLinkedProviders = function () {
  const providers = [];
  if (this.googleId) providers.push('google');
  if (this.facebookId) providers.push('facebook');
  if (this.appleId) providers.push('apple');
  if (this.password) providers.push('email');
  return providers;
};

// Método para verificar se um provedor específico está vinculado
userSchema.methods.hasProvider = function (providerName) {
  const providerMap = {
    'google': this.googleId,
    'facebook': this.facebookId,
    'apple': this.appleId,
    'email': this.password
  };
  return !!providerMap[providerName.toLowerCase()];
};

module.exports = mongoose.model('User', userSchema);