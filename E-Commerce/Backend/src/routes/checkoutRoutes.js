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
  console.log('Stripe Key Loaded:', stripeKey ? `${stripeKey.substring(0, 8)}...${stripeKey.substring(stripeKey.length - 4)}` : 'None');

  const { items, userEmail, paymentMethod } = req.body;
  console.log('Recebido pedido de checkout:', { userEmail, paymentMethod, itemsCount: items?.length });

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

    // MODO NOVO (AUTOMÁTICO) - Que mostra tudo no painel principal
    // Para PIX no Brasil, o Stripe pode exigir o CPF/CNPJ do cliente, o modo automatico gerencia isso melhor.
    sessionOptions.automatic_payment_methods = {
      enabled: true,
    };

    // Removemos payment_method_types pois ele conflita com automatic_payment_methods
    // sessionOptions.payment_method_types = ['card', 'pix']; 

    // Se quiser garantir que peça endereço/CPF se necessário:
    // sessionOptions.billing_address_collection = 'auto'; // ou 'required'

    const session = await stripe.checkout.sessions.create(sessionOptions);

    // Envia a URL da sessão de volta para o frontend
    res.json({ url: session.url });
  } catch (error) {
    console.error('Erro ao criar sessão do Stripe:', error);
    res.status(500).json({ error: 'Não foi possível iniciar o pagamento.', details: error.message });
  }
});

module.exports = router;