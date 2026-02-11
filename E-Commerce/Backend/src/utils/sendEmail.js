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

// 1. Mapeamento de Produtos (DESATIVADO - Legacy Fix Removido)
// O sistema agora confia nos dados passados pelo Controller (Banco de Dados)
const PRODUCT_REGISTRY = {};


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
 * Envia e-mail de download para o cliente.
 * Agora aceita imageUrl explicitamente para evitar lookups desnecessários.
 */
const enviarEmailDownload = async (email, nomeProduto, linkDownloadOriginal, productId, orderId = null, nomeCliente = null, imageUrl = null) => {
    if (!emailjsConfigured) {
        throw new Error('EmailJS não está configurado.');
    }

    try {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📩 [EmailJS] Iniciando envio de e-mail de download (Legacy Fix)');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        // --- 1. Resolução dos Dados (Simplificada) ---
        let finalLink = linkDownloadOriginal;
        let finalName = nomeProduto;
        // Usa a imagem passada ou um placeholder
        let finalImage = imageUrl || 'https://via.placeholder.com/150?text=Sem+Imagem';
        let finalPrice = "Pago";

        console.log(`ℹ️ [Email Info] Produto: ${finalName} | ID: ${productId}`);

        // --- 2. Preparação de Variáveis Simples ---
        const clientName = nomeCliente || email.split('@')[0];
        const generatedOrderId = orderId || Date.now(); // ID único numérico ou string

        // 3. Correção de URL: Garantir que é a URL pura (sem concatenações estranhas do passado)
        // Se vier com prefixos errados como "meusite.comhttps...", pega apenas a última ocorrência de http/https
        if (finalLink && (finalLink.includes('http://') || finalLink.includes('https://'))) {
            // Encontra a ÚLTIMA ocorrência de "http" para descartar qualquer prefixo incorreto
            const lastHttpIndex = finalLink.lastIndexOf('http');
            if (lastHttpIndex > 0) {
                finalLink = finalLink.substring(lastHttpIndex);
                console.log(`🔧 [URL Fix] Link corrigido (Double URL Removal): ${finalLink}`);
            }
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
