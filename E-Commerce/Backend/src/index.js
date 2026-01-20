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
const pixRoutes = require('./routes/pixRoutes');
const downloadRoutes = require('./routes/downloadRoutes');
const { sendEmail, enviarEmailDownload } = require('./utils/sendEmail');

// Conectar ao banco de dados
connectDB();

const PORT = 4000;
const app = express();
app.set('trust proxy', 1);

// Rota de atalho para o Feed do Google Shopping (Redireciona para o padrão BR ou US)
// PRECISA vir antes de qualquer middleware ou rota estática
app.get('/feed/products.xml', (req, res) => {
  // Redireciona para o feed padrão (Brasil) ou detecta via query param se quiser
  res.redirect('/api/produtos/feed/products/br.xml');
});

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

// Função auxiliar para obter o método de pagamento real
async function getPaymentMethodUsed(stripe, session) {
  try {
    // Se já tivermos a info no session (depende da versão da API)
    if (session.payment_method_options && session.payment_method_types && session.payment_method_types.length === 1) {
      return session.payment_method_types[0];
    }

    // Busca o Payment Intent para ter certeza
    if (session.payment_intent) {
      const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);
      // O tipo de método usado está em payment_method_types[0] do PI ou payment_method.type
      // Mas paymentIntent.payment_method (ID) precisa ser expandido ou buscado.
      // Simplified: paymentIntent.payment_method_types usually has just one if confirmed?
      // Actually, best is:
      if (paymentIntent.payment_method) {
        const method = await stripe.paymentMethods.retrieve(paymentIntent.payment_method);
        return method.type;
      }
    }
    return session.payment_method_types?.[0] || 'card';
  } catch (e) {
    console.error('Erro ao recuperar método de pagamento detalhado:', e);
    return session.payment_method_types?.[0] || 'card';
  }
}

async function criarPedido(session, pedidoItems, stripe) {
  const Pedido = mongoose.model('Pedido');
  const TransactionLog = mongoose.model('TransactionLog');

  let realPaymentMethod = 'card';
  if (stripe) {
    realPaymentMethod = await getPaymentMethodUsed(stripe, session);
  }

  const novoPedido = new Pedido({
    userEmail: session.customer_email,
    items: pedidoItems,
    totalPrice: session.amount_total / 100,
    stripeSessionId: session.id,
    paymentMethod: realPaymentMethod,
    isPaid: true,
    paidAt: new Date(),
  });
  await novoPedido.save();
  console.log(`Pedido ${novoPedido._id} criado com sucesso para ${session.customer_email}. Método: ${realPaymentMethod}`);

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
      paymentMethod: realPaymentMethod,
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
app.use(cors({
  origin: (origin, callback) => {
    // Permite conexões sem origem (como Postman, Apps Mobile ou servidor-para-servidor)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'https://gens-five.vercel.app',       // Antiga URL oficial (Vercel)
      'https://www.gensartessublimacao.com.br', // Nova URL oficial (Domínio Próprio)
      'https://gensartessublimacao.com.br',     // Nova URL oficial (sem www)
      'http://localhost:5173',              // Seu Vite Local
      'http://localhost:5174',              // Fallback port
      'http://192.168.18.220:5173',         // Seu teste na rede (celular)
      'https://gens-backend.onrender.com'   // O próprio backend
    ];

    // LÓGICA MÁGICA:
    // Aceita se estiver na lista ACIMA -OU- se o site terminar com ".vercel.app"
    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      console.log('Bloqueado pelo CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
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
      await criarPedido(session, pedidoItems, stripe);

      // --- AUTOMAÇÃO DE ENTREGA (Links de Download) ---
      console.log('Pagamento Stripe Confirmado. Processando envio de links...');
      try {
        const cartItems = JSON.parse(session.metadata.cartItems);
        const Produto = mongoose.model('Produto');

        for (const item of cartItems) {
          try {
            const produtoDb = await Produto.findById(item.id);

            if (produtoDb && produtoDb.downloadUrl) {
              // --- GERAÇÃO DE TOKEN SEGURO PARA EMAIL ---
              const crypto = require('crypto');
              const DownloadToken = require('./models/DownloadToken');

              const token = crypto.randomBytes(32).toString('hex');
              const expiresAt = new Date();
              expiresAt.setDate(expiresAt.getDate() + 7); // Validade de 7 dias para o link do email

              await DownloadToken.create({
                token,
                productId: produtoDb._id,
                userEmail: session.customer_details.email,
                orderId: session.id,
                downloadUrl: produtoDb.downloadUrl, // Salva a Key (ou URL) original
                expiresAt
              });

              // Montar o link completo para a API
              // O usuário clica -> API valida token -> Redireciona para R2 Signed URL
              const baseUrl = process.env.BASE_URL || 'http://localhost:4000';
              const secureEmailLink = `${baseUrl}/api/download/${token}`;

              // Enviar email com o LINK do Token
              await enviarEmailDownload(
                session.customer_details.email,
                produtoDb.productName,
                secureEmailLink, // Passamos o link http://.../api/download/xyz
                produtoDb._id,
                session.id,
                session.customer_details?.name || null
              );
              console.log(`Link seguro enviado (Stripe) para ${session.customer_details.email} - Token: ${token}`);
            } else {
              console.error(`ERRO: Produto ${item.id} não encontrado ou sem downloadUrl.`);
            }
          } catch (innerError) {
            console.error(`Erro ao buscar produto ${item.id}:`, innerError);
          }
        }
      } catch (emailError) {
        console.error('Falha ao enviar e-mails transacionais (Stripe):', emailError);
      }
      // -----------------------------------------------

      // Email consolidado removido - emails individuais já são enviados acima via enviarEmailDownload()
    } catch (error) {
      console.error('Erro ao processar webhook:', error);
    }
  }

  res.status(200).send();
});

app.use(express.json());

// --- Rota de Health Check (Uptime Robot) ---
app.get('/', (req, res) => {
  res.send('Estou acordado!');
});

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
app.use('/api/pix', pixRoutes);
app.use('/api/download', downloadRoutes);

const hotlinkProtection = require('./middleware/hotlinkProtection');

// Arquivos estáticos
// Arquivos estáticos - UPLOADS LOCAIS DESATIVADOS (Tudo via R2/Supabase)
// app.use('/uploads', hotlinkProtection, express.static(path.join(__dirname, '../uploads')));

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