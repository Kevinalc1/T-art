const emailjs = require('@emailjs/nodejs');

// --- CONFIGURAÇÃO DO EMAILJS ---
let emailjsConfigured = false;

// Verificar se as variáveis de ambiente estão configuradas
if (process.env.EMAILJS_SERVICE_ID && process.env.EMAILJS_PRIVATE_KEY) {
    emailjsConfigured = true;
    console.log('✅ EmailJS configurado como provedor de email.');
} else {
    console.error('❌ ERRO CRÍTICO: EmailJS não configurado!');
    console.error('Configure as seguintes variáveis de ambiente:');
    console.error('  - EMAILJS_SERVICE_ID');
    console.error('  - EMAILJS_PRIVATE_KEY');
    console.error('  - EMAILJS_PUBLIC_KEY');
    console.error('  - EMAILJS_TEMPLATE_ID (template para emails de download)');
    console.error('  - FRONTEND_URL (URL do frontend para links de download)');
}

/**
 * Envia um e-mail genérico usando EmailJS.
 */
const sendEmail = async ({ to, subject, html }) => {
    if (!emailjsConfigured) {
        throw new Error('EmailJS não está configurado. Verifique as variáveis de ambiente.');
    }

    try {
        console.log(`📩 [EmailJS] Tentando enviar e-mail para ${to}...`);

        // EmailJS usa templates, então vamos enviar os dados do template
        const templateParams = {
            to_email: to,
            subject: subject,
            message_html: html,
        };

        const response = await emailjs.send(
            process.env.EMAILJS_SERVICE_ID,
            process.env.EMAILJS_TEMPLATE_ID || process.env.EMAILJS_TEMPLATE_GENERIC,
            templateParams,
            {
                publicKey: process.env.EMAILJS_PUBLIC_KEY,
                privateKey: process.env.EMAILJS_PRIVATE_KEY,
            }
        );

        console.log(`✅ [EmailJS] E-mail enviado com sucesso!`);
        console.log(`📧 [EmailJS] Status: ${response.status}`);
        console.log(`🆔 [EmailJS] Message ID: ${response.text}`);

        return { success: true, messageId: response.text };
    } catch (error) {
        console.error(`❌ [EmailJS] ERRO ao enviar e-mail`);
        console.error(`📧 [EmailJS] Destinatário: ${to}`);
        console.error(`🔴 [EmailJS] Erro: ${error.message}`);
        console.error(`📋 [EmailJS] Stack:`, error.stack);
        throw error;
    }
};

/**
 * Envia e-mail com link de download do produto.
 * @param {string} email - Email do cliente
 * @param {string} nomeProduto - Nome do produto
 * @param {string} linkCloudinary - URL do arquivo no Cloudinary
 * @param {string} productId - ID do produto (MongoDB)
 * @param {string} orderId - ID do pedido (opcional)
 * @param {string} nomeCliente - Nome do cliente (opcional)
 */
const enviarEmailDownload = async (email, nomeProduto, linkCloudinary, productId, orderId = null, nomeCliente = null) => {
    if (!emailjsConfigured) {
        console.error('❌ [EmailJS] ERRO: EmailJS não configurado.');
        throw new Error('EmailJS não está configurado.');
    }

    // --- MAPA DE PRODUTOS (Fallback/Override) ---
    // Adicione aqui IDs do MongoDB e seus respectivos links do Cloudinary
    const PRODUCT_LINKS = {
        // Exemplo: '6755e1a3cc767566d5af1234': 'https://res.cloudinary.com/.../arquivo.zip',
    };

    try {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📩 [EmailJS] Iniciando envio de e-mail de download');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`📧 [Cliente] Email: ${email}`);
        console.log(`👤 [Cliente] Nome: ${nomeCliente || 'Não informado'}`);
        console.log(`📦 [Produto] Nome: ${nomeProduto}`);
        console.log(`🆔 [Produto] ID: ${productId}`);
        console.log(`🛒 [Pedido] ID: ${orderId || 'Não informado'}`);
        console.log(`🔗 [Cloudinary] URL Original: ${linkCloudinary}`);

        // Buscar link no mapa (se existir)
        let finalLink = linkCloudinary;
        if (productId && PRODUCT_LINKS[productId]) {
            console.log(`✅ [Mapa] Link encontrado no PRODUCT_LINKS para ID ${productId}`);
            finalLink = PRODUCT_LINKS[productId];
        }

        // Validar link final
        if (!finalLink || finalLink === 'undefined' || finalLink === 'null') {
            console.error('❌ [Validação] Link de download inválido!');
            throw new Error('Link de download inválido. Entre em contato com o suporte.');
        }

        console.log(`🔗 [Link Final] ${finalLink}`);

        // Extrair nome do cliente do email (se não fornecido)
        const clientName = nomeCliente || email.split('@')[0];

        // Gerar Order ID (timestamp ou usar o fornecido)
        const generatedOrderId = orderId || `ORDER-${Date.now()}`;

        // Montar array de orders (formato esperado pelo template)
        const orders = [
            {
                nome: nomeProduto,
                preço: 'Pago'
            }
        ];

        // --- PARÂMETROS DO TEMPLATE (FORMATO CUSTOMIZADO) ---
        const templateParams = {
            nome_cliente: clientName,
            link_download: finalLink,
            order_id: generatedOrderId,
            email: email,
            orders: orders
        };

        console.log('📋 [Template] Parâmetros montados:');
        console.log(JSON.stringify(templateParams, null, 2));
        console.log('📤 [EmailJS] Enviando e-mail...');

        // Enviar e-mail via EmailJS
        const response = await emailjs.send(
            process.env.EMAILJS_SERVICE_ID,
            process.env.EMAILJS_TEMPLATE_ID,
            templateParams,
            {
                publicKey: process.env.EMAILJS_PUBLIC_KEY,
                privateKey: process.env.EMAILJS_PRIVATE_KEY,
            }
        );

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ [EmailJS] E-MAIL ENVIADO COM SUCESSO!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`📧 [EmailJS] Status: ${response.status}`);
        console.log(`🆔 [EmailJS] Message ID: ${response.text}`);
        console.log(`📦 [Produto] ${nomeProduto}`);
        console.log(`🔗 [Link] ${finalLink}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        return {
            success: true,
            messageId: response.text,
            orderId: generatedOrderId
        };

    } catch (error) {
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('❌ [EmailJS] ERRO FATAL AO ENVIAR E-MAIL');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error(`📧 [Cliente] Email: ${email}`);
        console.error(`📦 [Produto] Nome: ${nomeProduto}`);
        console.error(`🔴 [Erro] Mensagem: ${error.message}`);

        // Log completo da resposta de erro para debug
        if (error.response) {
            console.error(`📋 [Erro] Resposta completa:`, JSON.stringify(error.response, null, 2));
        }

        console.error(`📋 [Erro] Stack:`, error.stack);
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        throw new Error(`Falha no envio de e-mail: ${error.message}`);
    }
};

module.exports = { sendEmail, enviarEmailDownload };
