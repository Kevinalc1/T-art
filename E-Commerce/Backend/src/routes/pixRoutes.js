const express = require('express');
const router = express.Router();
const { MercadoPagoConfig, Payment } = require('mercadopago');
const { enviarEmailDownload } = require('../utils/sendEmail');
const Produto = require('../models/Produto');

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
            metadata: {
                user_email: userEmail,
                items: items.map(i => ({ id: i._id, name: i.productName }))
            },
            notification_url: 'https://gens-backend.onrender.com/api/pix/webhook'
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

// @route   GET /api/pix/status/:id
router.get('/status/:id', async (req, res) => {
    const { id } = req.params;

    if (!process.env.MP_ACCESS_TOKEN) {
        return res.status(500).json({ error: 'Configuração inválida' });
    }

    try {
        const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
        const payment = new Payment(client);

        const paymentInfo = await payment.get({ id });

        res.json({
            id: paymentInfo.id,
            status: paymentInfo.status,
            status_detail: paymentInfo.status_detail
        });
    } catch (error) {
        console.error('Erro ao consultar status Pix:', error);
        res.status(500).json({ error: 'Erro ao consultar pagamento' });
    }
});

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
                const items = metadata.items || [];

                console.log(`Pagamento Pix Aprovado para ${userEmail}. Processando ${items.length} itens.`);

                for (const item of items) {
                    try {
                        const produtoDb = await Produto.findById(item.id);

                        if (produtoDb && produtoDb.downloadUrl) {
                            await enviarEmailDownload(userEmail, produtoDb.productName, produtoDb.downloadUrl);
                            console.log(`Link enviado para ${userEmail} (Produto: ${produtoDb.productName})`);
                        } else {
                            console.error(`ERRO: Produto ${item.id} não encontrado ou sem downloadUrl.`);
                        }
                    } catch (dbError) {
                        console.error(`Erro ao buscar produto ${item.id}:`, dbError);
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
