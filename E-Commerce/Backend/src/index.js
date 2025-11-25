// 1. Importar dependências
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');

// --- VERIFICAÇÃO DE VARIÁVEIS DE AMBIENTE ESSENCIAIS ---
if (!process.env.JWT_SECRET) {
  console.error('ERRO FATAL: A variável de ambiente JWT_SECRET não foi definida.');
  console.error('Por favor, verifique seu arquivo .env na raiz do projeto backend.');
  process.exit(1); // Encerra a aplicação se a variável não estiver definida
}

// Verifica se a chave secreta do Stripe foi carregada
const stripeApiKey = process.env.STRIPE_SECRET_KEY;
if (!stripeApiKey) {
  console.error('ERRO: A variável de ambiente STRIPE_SECRET_KEY não foi definida.');
  console.error('Por favor, verifique se você criou um arquivo .env no diretório /Backend e adicionou sua chave secreta do Stripe nele.');
  process.exit(1);
}
const stripe = require('stripe')(stripeApiKey);

// Importar conexão com DB e Modelo
const connectDB = require('./config/database');

// --- REGISTRO DE MODELOS ---
// Importe TODOS os modelos aqui, ANTES de importar qualquer rota.
// Isso garante que o Mongoose conheça todos os schemas antes que as rotas tentem usá-los.
require('./models/Category');
require('./models/Produto');
require('./models/Pedido');
require('./models/User');
require('./models/Colecao');

// --- IMPORTAÇÃO DE ROTAS ---
// Ordem ajustada para carregar dependências mais simples primeiro
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes'); // Importando a nova rota de categorias
const productRoutes = require('./routes/productRoutes');
const colecaoRoutes = require('./routes/colecaoRoutes');
const checkoutRoutes = require('./routes/checkoutRoutes');
const pedidoRoutes = require('./routes/pedidoRoutes');
const sendEmail = require('./utils/sendEmail');

// Conectar ao banco de dados
connectDB();

// REMOVIDO: const mockProdutos = require('./data/mockProdutos');
// 3. Definir porta e inicializar app
const PORT = 4000;
const app = express();

// --- Funções Auxiliares para o Webhook ---

/**
 * Prepara os itens para salvar no pedido e gera o HTML com os links de download para o e-mail.
 * @param {Array} cartItems - Itens do carrinho vindos dos metadados do Stripe.
 * @returns {Object} - Um objeto contendo `pedidoItems` para o DB e `emailHtmlLinks` para o e-mail.
 */
async function prepararItensPedidoEEmail(cartItems) {
  // Obtenha os modelos diretamente do Mongoose para evitar problemas de escopo
  const Produto = mongoose.model('Produto');

  const pedidoItems = [];
  let emailHtmlLinks = '';

  for (const item of cartItems) {
    const produto = await Produto.findById(item.id);
    if (produto) {
      pedidoItems.push({
        productName: produto.productName,
        price: produto.price,
        quantidade: item.quantidade,
        downloadUrl: produto.downloadUrl, // Adiciona o link de download ao item do pedido
      });
      emailHtmlLinks += `
        <div style="margin-bottom: 15px; padding: 10px; border: 1px solid #eee; border-radius: 5px;">
          <strong>${produto.productName}</strong><br>
          <a href="${produto.downloadUrl}">Clique aqui para baixar</a>
        </div>
      `;
    }
  }
  return { pedidoItems, emailHtmlLinks };
}

/**
 * Cria e salva um novo pedido no banco de dados.
 * @param {Object} session - A sessão do Stripe.
 * @param {Array} pedidoItems - Os itens do pedido já preparados.
 */
async function criarPedido(session, pedidoItems) {
  // Obtenha os modelos diretamente do Mongoose
  const Pedido = mongoose.model('Pedido');

  const novoPedido = new Pedido({
    userEmail: session.customer_email,
    items: pedidoItems,
    totalPrice: session.amount_total / 100, // Converte de centavos para o valor normal
    stripeSessionId: session.id,
    isPaid: true,
    paidAt: new Date(),
  });
  await novoPedido.save();
  console.log(`Pedido ${novoPedido._id} criado com sucesso para ${session.customer_email}.`);
}

// -----------------------------------------


// 4. Configurar middlewares principais
// O CORS deve vir antes das rotas para lidar com as requisições pre-flight do navegador.
app.use(cors({
  origin: 'http://localhost:5173', // Permite requisições apenas do seu frontend
  credentials: true, // Permite o envio de cookies e cabeçalhos de autorização
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos HTTP permitidos
  allowedHeaders: ['Content-Type', 'Authorization'], // Cabeçalhos permitidos
}));


// Rota do webhook do Stripe para ouvir eventos
// Esta rota deve vir ANTES de app.use(express.json()) porque o Stripe precisa do 'raw body'
app.post('/api/checkout/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error(`⚠️  Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Lidar com o evento
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('Checkout session foi concluída!', session.id);

      try {
        const cartItems = JSON.parse(session.metadata.cartItems);
        const { pedidoItems, emailHtmlLinks } = await prepararItensPedidoEEmail(cartItems);

        await criarPedido(session, pedidoItems);

        const emailCompletoHtml = `
          <h1>Obrigado pela sua compra!</h1>
          <p>Olá! Seu pagamento foi confirmado e seu pedido foi processado com sucesso.</p>
          <p>Abaixo estão os links para download dos seus produtos:</p>
          ${emailHtmlLinks}
          <p>Qualquer dúvida, basta responder a este e-mail.</p>
          <p>Atenciosamente,<br>T-art</p>
        `;

        await sendEmail({
          to: session.customer_email,
          subject: 'Seu Pedido e Links de Download - T-art',
          html: emailCompletoHtml
        });
      } catch (error) {
        console.error('Erro ao processar o webhook checkout.session.completed:', error);
      }
      break;
    default:
      console.log(`Evento não tratado do tipo ${event.type}`);
  }

  // Retorna uma resposta 200 para o Stripe para confirmar o recebimento do evento
  res.status(200).send();
});

// 4. Configurar middleware
app.use(cors({
  origin: 'http://localhost:5173', // Permite requisições apenas do seu frontend
  credentials: true, // Permite o envio de cookies e cabeçalhos de autorização
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos HTTP permitidos
  allowedHeaders: ['Content-Type', 'Authorization'], // Cabeçalhos permitidos
}));

app.use(express.json());

// Rotas de Autenticação
app.use('/api/auth', authRoutes);

// Rotas de Produtos
app.use('/api/produtos', productRoutes);

// Rotas de Checkout
app.use('/api/checkout', checkoutRoutes);

// Rotas de Coleções
app.use('/api/colecoes', colecaoRoutes);

// Rotas de Categorias
app.use('/api/categorias', categoryRoutes);

// Rotas de Pedidos
app.use('/api/pedidos', pedidoRoutes);

// Rotas de Upload
const uploadRoutes = require('./routes/uploadRoutes');
app.use('/api/upload', uploadRoutes);

// Servir arquivos estáticos da pasta uploads
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// --- MIDDLEWARE DE TRATAMENTO DE ERROS ---
// Deve ser adicionado DEPOIS de todas as suas rotas.

// Middleware para rotas não encontradas (Erro 404)
app.use((req, res, next) => {
  const error = new Error(`Rota não encontrada - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// Middleware para todos os outros erros (Erro 500, 401, etc.)
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// 7. Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});