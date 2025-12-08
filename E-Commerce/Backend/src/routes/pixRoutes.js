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
                    number: userDoc
                }
            },
            notification_url: 'https://gens-backend.onrender.com/api/webhook/mercadopago',
            metadata: {
                user_email: userEmail,
                items: items.map(i => ({ id: i._id, name: i.productName }))
            }
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

const { enviarEmailDownload } = require('../utils/sendEmail');

// @route   POST /api/pix/webhook
router.post('/webhook', async (req, res) => {
    const { type, data } = req.body;
    console.log('Webhook Mercado Pago Recebido:', type, data);

    if (type === 'payment') {
        try {
            const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
            const payment = new Payment(client);

            // Consultar status real
            const paymentInfo = await payment.get({ id: data.id });
            const status = paymentInfo.status;

            console.log(`Status do Pagamento Pix ${data.id}: ${status}`);

            if (status === 'approved') {
                const metadata = paymentInfo.metadata || {};
                const userEmail = metadata.user_email || paymentInfo.payer.email;
                const items = metadata.items || []; // Array de { id, name }

                console.log(`Pagamento Pix Aprovado para ${userEmail}. Processando ${items.length} itens.`);

                for (const item of items) {
                    // Busca link no mapa
                    const link = PRODUCT_LINKS[item.id] || PRODUCT_LINKS['default'];

                    if (link) {
                        try {
                            await enviarEmailDownload(userEmail, item.name, link);
                            console.log(`Link enviado para ${userEmail} (Produto: ${item.name})`);
                        } catch (emailErr) {
                            console.error(`Falha no envio de email para ${userEmail}:`, emailErr.message);
                        }
                    } else {
                        console.error(`ERRO CRÍTICO: Produto ${item.id} (${item.name}) sem link cadastrado!`);
                    }
                }
            }
        } catch (error) {
            console.error('Erro ao processar webhook Pix:', error);
        }
    }

    res.status(200).send('OK');
});

module.exports = router;
