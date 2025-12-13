const mongoose = require('mongoose');
const Pedido = mongoose.model('Pedido');
const Produto = mongoose.model('Produto');
const { generateSignedDownloadLink } = require('../services/storageService');

/**
 * @desc    Solicitar link de download seguro
 * @route   POST /api/download/secure
 * @access  Private-
 */
const requestDownload = async (req, res) => {
    const { productId } = req.body;
    const userEmail = req.user.email; // Assumindo que vem do middleware protect

    if (!productId) {
        return res.status(400).json({ message: 'ID do produto é obrigatório.' });
    }

    try {
        console.log(`🔐 [Download Seguro] Solicitado por ${userEmail} para produto ${productId}`);

        // 1. Verificar se o usuário comprou o produto e se o pagamento foi confirmado
        const pedido = await Pedido.findOne({
            userEmail: userEmail,
            'items.productId': productId,
            isPaid: true
        });

        if (!pedido) {
            console.warn(`⛔ [Download Seguro] Acesso negado. Pedido não encontrado ou não pago para ${userEmail}.`);
            return res.status(403).json({
                message: 'Você não possui permissão para baixar este arquivo. Verifique se a compra foi confirmada.'
            });
        }

        // 2. Buscar informações do produto para pegar o link/key do arquivo
        const produto = await Produto.findById(productId);
        if (!produto) {
            return res.status(404).json({ message: 'Produto não encontrado.' });
        }

        // Determinar qual arquivo baixar (prioridade: vectorUrl > downloadUrl)
        // Assumindo que o campo armazena a Key do R2 ou uma URL completa da qual extrairemos a Key
        let fileKey = produto.vectorUrl || produto.downloadUrl;

        if (!fileKey) {
            return res.status(404).json({ message: 'Arquivo digital não disponível para este produto.' });
        }

        // Se for uma URL completa, tentar extrair a key (lógica básica, ajustar conforme formato real no DB)
        // Exemplo http://.../balde/pasta/arquivo.zip -> pasta/arquivo.zip
        // Por segurança, vamos assumir que se começar com http, precisamos processar, senão é a key direta.
        // Lógica ROBUSTA para extrair a Key do R2, independente do que estiver salvo no banco
        // Cenários possíveis no DB:
        // 1. "uploads/arquivo.cdr" (Key limpa - Ideal)
        // 2. "/uploads/arquivo.cdr" (Caminho absoluto)
        // 3. "http://localhost:4000/uploads/arquivo.cdr" (URL local antiga)
        // 4. "https://backend.com/uploads/arquivo.cdr" (URL antiga)

        // Remove protocolo e domínio se existir
        if (fileKey.includes('/uploads/')) {
            // Pega tudo a partir de 'uploads/'
            // Ex: http://site.com/uploads/pasta/arquivo.zip -> uploads/pasta/arquivo.zip
            fileKey = fileKey.substring(fileKey.indexOf('uploads/'));
        }

        // Remove barra inicial se sobrou (ex: /uploads/...)
        if (fileKey.startsWith('/')) {
            fileKey = fileKey.substring(1);
        }

        // Decodificar URI caso tenha espaços ou caracteres especiais (ex: %20)
        fileKey = decodeURIComponent(fileKey);

        // Debug
        console.log(`🧹 [Download Seguro] Key limpa: ${fileKey}`);

        // Decodificar URI caso tenha espaços ou caracteres especiais
        fileKey = decodeURIComponent(fileKey);

        console.log(`📂 [Download Seguro] Gerando link para key: ${fileKey}`);

        // 3. Gerar URL assinada
        const signedUrl = await generateSignedDownloadLink(fileKey);

        res.json({
            downloadUrl: signedUrl,
            fileName: fileKey.split('/').pop(),
            message: 'Link de download gerado com sucesso. Válido por 1 hora.'
        });

    } catch (error) {
        console.error('❌ [Download Seguro] Erro no controller:', error);
        res.status(500).json({ message: 'Erro ao processar o download.' });
    }
};

module.exports = {
    requestDownload
};
