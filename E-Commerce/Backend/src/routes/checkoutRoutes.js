const express = require('express');
const router = express.Router();

// @desc    Criar uma sessão de checkout do Stripe
// @route   POST /api/checkout/create-checkout-session
// @access  Public
router.post('/create-checkout-session', async (req, res) => {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    console.error("CRITICAL ERROR: STRIPE_SECRET_KEY is missing.");
    return res.status(500).json({ error: 'Erro de configuração do servidor.' });
  }
  const stripe = require('stripe')(stripeKey);

  const { items, userEmail, paymentMethod } = req.body;

  try {
    // Validação: Garante que 'items' é um array e não está vazio.
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'O carrinho está vazio ou os itens são inválidos.' });
    }

    // Transforma os itens do carrinho para o formato que o Stripe espera
    const line_items = items.map((item) => {
      return {
        price_data: {
          currency: 'brl',
          product_data: {
            name: item.productName,
          },
          // O Stripe trabalha com centavos, então multiplicamos o preço por 100
          unit_amount: Math.round(parseFloat(item.price) * 100),
        },
        quantity: item.quantidade,
      };
    });

    // Configurações base para a sessão do Stripe
    const sessionOptions = {
      mode: 'payment',
      line_items: line_items,
      customer_email: userEmail,
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/confirmacao`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/carrinho`,
      // Adiciona os IDs dos produtos e quantidades como metadados
      metadata: {
        cartItems: JSON.stringify(items.map(item => ({
          id: item._id, // O ID do produto no MongoDB
          quantidade: item.quantidade
        })))
      },
    };

    // Adiciona lógica condicional para o método de pagamento
    if (paymentMethod === 'pix') {
      sessionOptions.payment_method_types = ['pix'];
      // Para PIX no Brasil, o Stripe exige o CPF/CNPJ do cliente
      sessionOptions.billing_address_collection = 'required';
      sessionOptions.payment_method_options = {
        pix: { expires_after_seconds: 3600 }, // PIX expira em 1 hora
      };
    } else { // Padrão é 'card'
      sessionOptions.payment_method_types = ['card'];
    }

    const session = await stripe.checkout.sessions.create(sessionOptions);

    // Envia a URL da sessão de volta para o frontend
    res.json({ url: session.url });
  } catch (error) {
    console.error('Erro ao criar sessão do Stripe:', error);
    res.status(500).json({ error: 'Não foi possível iniciar o pagamento.' });
  }
});

module.exports = router;