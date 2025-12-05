const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');
const passport = require('passport');

// --- VERIFICAÇÃO DE VARIÁVEIS DE AMBIENTE ESSENCIAIS ---
if (!process.env.JWT_SECRET) {
  console.error('ERRO FATAL: A variável de ambiente JWT_SECRET não foi definida.');
  console.error('Por favor, verifique seu arquivo .env na raiz do projeto backend.');
  process.exit(1);
}

const stripeApiKey = process.env.STRIPE_SECRET_KEY;
if (!stripeApiKey) {
  console.error('ERRO: A variável de ambiente STRIPE_SECRET_KEY não foi definida.');
  process.exit(1);
}
const stripe = require('stripe')(stripeApiKey);

// Importar conexão com DB
const connectDB = require('./config/database');

// --- REGISTRO DE MODELOS ---
require('./models/Category');
require('./models/Produto');
require('./models/Pedido');
require('./models/User');
require('./models/Colecao');
require('./models/Banner');
require('./models/TransactionLog');
require('./models/AdSlot');

// Importar configuração do Passport APÓS os modelos
require('./config/passport');

// --- IMPORTAÇÃO DE ROTAS ---
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const colecaoRoutes = require('./routes/colecaoRoutes');
const checkoutRoutes = require('./routes/checkoutRoutes');
const pedidoRoutes = require('./routes/pedidoRoutes');
const userRoutes = require('./routes/userRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const bannerRoutes = require('./routes/bannerRoutes');
const transactionLogRoutes = require('./routes/transactionLogRoutes');
const adSlotRoutes = require('./routes/adSlotRoutes');
const sendEmail = require('./utils/sendEmail');

// Conectar ao banco de dados
connectDB();

const PORT = 4000;
const app = express();

// --- Funções Auxiliares para o Webhook ---
async function prepararItensPedidoEEmail(cartItems) {
  const Produto = mongoose.model('Produto');
  const pedidoItems = [];
  let emailHtmlLinks = '';
  const baseUrl = process.env.BASE_URL || 'http://localhost:4000';

  for (const item of cartItems) {
    const produto = await Produto.findById(item.id);
    if (produto) {
      let downloadLink = produto.downloadUrl;
      if (downloadLink && downloadLink.startsWith('/')) {
        downloadLink = `${baseUrl}${downloadLink}`;
      }
      const imageUrl = produto.imageUrls && produto.imageUrls.length > 0 ? produto.imageUrls[0] : '';

      pedidoItems.push({
        productName: produto.productName,
        productId: produto._id,
        price: produto.price,
        quantidade: item.quantidade,
        downloadUrl: produto.downloadUrl,
      });

      emailHtmlLinks += `
        <div style="margin-bottom: 15px; padding: 10px; border: 1px solid #eee; border-radius: 5px;">
          <strong>${produto.productName}</strong><br>
          ${imageUrl ? `<img src="${imageUrl}" alt="${produto.productName}" style="max-width: 200px; height: auto; margin: 10px 0; display: block;">` : ''}
          <p>Arquivo para Download (CDR/Arte):</p>
          <a href="${downloadLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Baixar Arquivo</a>
        </div>
      `;
    }
  }
  return { pedidoItems, emailHtmlLinks };
}

async function criarPedido(session, pedidoItems) {
  const Pedido = mongoose.model('Pedido');
  const TransactionLog = mongoose.model('TransactionLog');

  const novoPedido = new Pedido({
    userEmail: session.customer_email,
    items: pedidoItems,
    totalPrice: session.amount_total / 100,
    stripeSessionId: session.id,
    isPaid: true,
    paidAt: new Date(),
  });
  await novoPedido.save();
  console.log(`Pedido ${novoPedido._id} criado com sucesso para ${session.customer_email}.`);

  // Criar log de transação
  try {
    await TransactionLog.create({
      type: 'PAYMENT',
      amount: session.amount_total / 100,
      currency: session.currency.toUpperCase(),
      orderId: novoPedido._id,
      userEmail: session.customer_email,
      stripeSessionId: session.id,
      stripeTransactionId: session.payment_intent,
      paymentMethod: session.payment_method_types?.[0] || 'card',
      status: 'completed',
      description: `Pagamento recebido - Pedido #${novoPedido._id}`,
      metadata: {
        itemsCount: pedidoItems.length,
        paymentStatus: session.payment_status,
      },
      createdBy: 'system',
    });
    console.log(`Log de transação criado para pedido ${novoPedido._id}`);
  } catch (error) {
    console.error('Erro ao criar log de transação:', error);
  }
}

// --- MIDDLEWARES ---
const envOrigins = (process.env.FRONTEND_URL || '').split(',');
const defaultOrigins = ['http://localhost:5173', 'http://192.168.18.220:5173'];
const allowedOrigins = [...new Set([...envOrigins, ...defaultOrigins])].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Permitir requisições sem origin (como mobile apps ou curl)
    if (!origin) return callback(null, true);

    // Normalização: remover barra final se existir para comparação
    const normalizedOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin;

    const isAllowed = allowedOrigins.some(allowed => {
      const normalizedAllowed = allowed.endsWith('/') ? allowed.slice(0, -1) : allowed;
      return normalizedAllowed === normalizedOrigin;
    });

    if (isAllowed || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      console.error(`[CORS ERROR] A origem '${origin}' (normalizada: '${normalizedOrigin}') foi bloqueada. Lista permitida:`, allowedOrigins);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(passport.initialize());

// Webhook Stripe (antes do express.json)
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

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
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
      console.error('Erro ao processar webhook:', error);
    }
  }

  res.status(200).send();
});

app.use(express.json());

// --- ROTAS ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/produtos', productRoutes);
app.use('/api/categorias', categoryRoutes);
app.use('/api/colecoes', colecaoRoutes);
app.use('/api/pedidos', pedidoRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/transaction-logs', transactionLogRoutes);
app.use('/api/ad-slots', adSlotRoutes);

const hotlinkProtection = require('./middleware/hotlinkProtection');

// Arquivos estáticos
app.use('/uploads', hotlinkProtection, express.static(path.join(__dirname, '../uploads')));

// Teste de Email
app.get('/api/test-email', async (req, res) => {
  try {
    await sendEmail({
      to: 'kevin.alc1@gmail.com',
      subject: 'Teste de Envio de Email',
      html: '<h1>Isso é um teste</h1>'
    });
    res.send('Email enviado!');
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Error Handling
app.use((req, res, next) => {
  const error = new Error(`Rota não encontrada - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// Escutar em todas as interfaces de rede (0.0.0.0) para permitir acesso via rede local
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`➜ Local:   http://localhost:${PORT}`);
  console.log(`➜ Network: http://192.168.18.220:${PORT}`);
});