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

// 1. Mapeamento de Produtos (Simulação de Banco de Dados)
const PRODUCT_REGISTRY = {
    // Exemplo: 'ID_DO_PRODUTO': { link: 'URL_SUPABASE', nome: 'Nome Produto', imagem: 'URL_IMAGEM' }
    '6755e1a3cc767566d5af1234': {
        link: 'https://supabase.co/storage/v1/object/public/uploads/arquivo.zip',
        nome: 'Pack de Artes Exclusivas',
        imagem: 'https://minha-loja.com/imagem-produto.jpg'
    },
    // ADICIONE SEUS PRODUTOS AQUI (Substitua pelos dados reais depois)
};

/**
 * Envia um e-mail genérico usando EmailJS.
 */
const sendEmail = async ({ to, subject, html }) => {
    if (!emailjsConfigured) {
        throw new Error('EmailJS não está configurado. Verifique as variáveis de ambiente.');
    }

    try {
        console.log(`📩 [EmailJS] Tentando enviar e-mail para ${to}...`);

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
        return { success: true, messageId: response.text };
    } catch (error) {
        console.error(`❌ [EmailJS] ERRO ao enviar e-mail genérico:`, error);
        throw error;
    }
};

/**
 * Envia e-mail de download para o cliente com estrutura CORRIGIDA.
 */
const enviarEmailDownload = async (email, nomeProduto, linkDownloadOriginal, productId, orderId = null, nomeCliente = null) => {
    if (!emailjsConfigured) {
        throw new Error('EmailJS não está configurado.');
    }

    try {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📩 [EmailJS] Iniciando envio de e-mail de download (Legacy Fix)');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        // --- 1. Resolução dos Dados (Usando PRODUCT_REGISTRY se disponível) ---
        let finalLink = linkDownloadOriginal;
        let finalName = nomeProduto;
        let finalImage = 'https://via.placeholder.com/150?text=Sem+Imagem';
        let finalPrice = "Pago"; // Valor fixo ou dinâmico se tiver

        if (productId && PRODUCT_REGISTRY[productId]) {
            console.log(`✅ [Registry] Produto encontrado no PRODUCT_REGISTRY: ${productId}`);
            const produtoReg = PRODUCT_REGISTRY[productId];
            // finalLink = produtoReg.link; // DESATIVADO: Usar o link dinâmico seguro gerado pelo controller
            finalName = produtoReg.nome;
            finalImage = produtoReg.imagem;
        } else {
            console.warn(`⚠️ [Registry] Produto ${productId} não encontrado no registro, usando dados passados.`);

            // Fallback: Tenta buscar imagem do banco se não estiver no registro estático
            try {
                const Produto = require('../models/Produto');
                const produtoDb = await Produto.findById(productId);
                if (produtoDb && produtoDb.imageUrls && produtoDb.imageUrls.length > 0) {
                    finalImage = produtoDb.imageUrls[0];
                }
            } catch (err) {
                console.warn('⚠️ [DB] Falha ao buscar imagem do banco:', err.message);
            }
        }

        // --- 2. Preparação de Variáveis Simples ---
        const clientName = nomeCliente || email.split('@')[0];
        const generatedOrderId = orderId || Date.now(); // ID único numérico ou string

        // 3. Correção de URL: Garantir que é a URL pura (sem concatenações estranhas do passado)
        // Se vier com prefixos errados como "meusite.comhttps...", tenta limpar
        if (finalLink && finalLink.includes('http') && finalLink.indexOf('http') > 0) {
            finalLink = finalLink.substring(finalLink.indexOf('http'));
            console.log(`🔧 [URL Fix] Link corrigido para: ${finalLink}`);
        }

        // --- 4. Montagem do templateParams (ESTRUTURA OBRIGATÓRIA) ---
        const templateParams = {
            // Variáveis simples
            nome_cliente: clientName,
            email: email,
            link_download: finalLink, // URL PURA
            order_id: generatedOrderId,

            // OBRIGATÓRIO: Array de objetos para o loop {{#orders}}
            orders: [
                {
                    nome: finalName,
                    preço: finalPrice,
                    imagem_produto: finalImage // URL para tag <img src>
                }
            ]
        };

        console.log('📋 [Template] Parâmetros Finais:', JSON.stringify(templateParams, null, 2));

        // --- 5. Envio ---
        const response = await emailjs.send(
            process.env.EMAILJS_SERVICE_ID,
            process.env.EMAILJS_TEMPLATE_ID,
            templateParams,
            {
                publicKey: process.env.EMAILJS_PUBLIC_KEY,
                privateKey: process.env.EMAILJS_PRIVATE_KEY,
            }
        );

        console.log('✅ [EmailJS] E-MAIL DE DOWNLOAD ENVIADO COM SUCESSO!');
        return { success: true, messageId: response.text };

    } catch (error) {
        console.error('❌ [EmailJS] ERRO FATAL AO ENVIAR E-MAIL DE DOWNLOAD:', error);
        throw error;
    }
};

module.exports = { sendEmail, enviarEmailDownload };
