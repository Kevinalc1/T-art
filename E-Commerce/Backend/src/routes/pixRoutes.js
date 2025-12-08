const express = require('express');
const router = express.Router();
const { MercadoPagoConfig, Payment } = require('mercadopago');

// @route   POST /api/pix/create-pix-payment
router.post('/create-pix-payment', async (req, res) => {
    const { items, userEmail, userDoc } = req.body;

    if (!process.env.MP_ACCESS_TOKEN) {
        console.error("ERRO: MP_ACCESS_TOKEN não definido.");
        return res.status(500).json({ error: 'Erro de configuração do servidor (Mercado Pago).' });
    }

    const client = new MercadoPagoConfig({
        accessToken: process.env.MP_ACCESS_TOKEN
    });

    try {
        const payment = new Payment(client);

        // Calcula o total
        const totalAmount = items.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantidade), 0);

        const body = {
            transaction_amount: Number(totalAmount.toFixed(2)),
            description: `Pedido de ${userEmail}`,
            payment_method_id: 'pix',
            payer: {
                email: userEmail,
                identification: {
                    type: 'CPF',
                    number: userDoc // Ex: '12345678909'
                }
            },
            // Notificação (Webhook) - Ajustar URL conforme seu ambiente
            notification_url: `${process.env.BASE_URL || 'http://localhost:4000'}/api/pix/webhook`
        };

        const result = await payment.create({ body });

        res.json({
            id: result.id,
            status: result.status,
            qr_code: result.point_of_interaction.transaction_data.qr_code_base64,
            qr_code_copy_paste: result.point_of_interaction.transaction_data.qr_code,
            ticket_url: result.point_of_interaction.transaction_data.ticket_url
        });

    } catch (error) {
        console.error('Erro Mercado Pago:', error);
        res.status(500).json({ error: 'Erro ao gerar Pix', details: error.message });
    }
});

// @route   POST /api/pix/webhook
router.post('/webhook', async (req, res) => {
    // Implementação básica para receber notificações
    // Aqui você deve validar a notificação e atualizar o status do pedido no seu banco
    const { type, data } = req.body;
    console.log('Webhook Mercado Pago Recebido:', type, data);

    // TODO: Buscar o pedido pelo ID do pagamento (data.id) e atualizar para 'pago'

    res.status(200).send('OK');
});

module.exports = router;
