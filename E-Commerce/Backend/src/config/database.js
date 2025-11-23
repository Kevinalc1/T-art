const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('ERRO: A variável de ambiente MONGO_URI não foi definida.');
      console.error('Por favor, verifique seu arquivo .env e adicione a string de conexão do MongoDB.');
      process.exit(1);
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB conectado com sucesso.');
  } catch (error) {
    console.error(`Erro ao conectar ao MongoDB: ${error.message}`);
    // Encerra o processo com falha
    process.exit(1);
  }
};

module.exports = connectDB;