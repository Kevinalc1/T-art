// 1. Importar dependências
const express = require('express');
const cors = require('cors');
require('dotenv').config();

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
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const checkoutRoutes = require('./routes/checkoutRoutes');
const colecaoRoutes = require('./routes/colecaoRoutes');
const pedidoRoutes = require('./routes/pedidoRoutes');
const Pedido = require('./models/Pedido');
const Produto = require('./models/Produto');
const sendEmail = require('./utils/sendEmail');

// Conectar ao banco de dados
connectDB();

// REMOVIDO: const mockProdutos = require('./data/mockProdutos');
// 3. Definir porta e inicializar app
const PORT = 4000;
const app = express();

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
          <p>Atenciosamente,<br>Cristiano</p>
        `;

        await sendEmail({
          to: session.customer_email,
          subject: 'Seu Pedido e Links de Download - Cristianoalc',
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
app.use(cors());
app.use(express.json());

// Rotas de Autenticação
app.use('/api/auth', authRoutes);

// Rotas de Produtos
app.use('/api/produtos', productRoutes);

// Rotas de Checkout
app.use('/api/checkout', checkoutRoutes);

// Rotas de Coleções
app.use('/api/colecoes', colecaoRoutes);

// Rotas de Pedidos
app.use('/api/pedidos', pedidoRoutes);

// 7. Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});