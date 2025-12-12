const express = require('express');
const router = express.Router();
const DownloadToken = require('../models/DownloadToken');
// Importar middleware de auth
const { protect } = require('../middleware/authMiddleware');
const { requestDownload } = require('../controllers/downloadController');

// ==============================================================================
// 1. ROTAS ESPECÍFICAS (Devem vir ANTES das rotas dinâmicas como /:token)
// ==============================================================================

// @desc    Rota de teste para download (gens.zip)
// @route   GET /api/download/test-download
router.get('/test-download', async (req, res) => {
    try {
        const { getDownloadLink } = require('../services/storageService');
        // 'gens.zip' conforme solicitado pelo usuário
        const url = await getDownloadLink('gens.zip');
        res.json({ url });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// @desc    Solicitar link de download seguro (Baseado na compra)
// @route   POST /api/download/secure
// @access  Private (Requer Login)
router.post('/secure', protect, requestDownload);

// ==============================================================================
// 2. ROTAS DINÂMICAS
// ==============================================================================

/**
 * GET /api/download/:token
 * Valida token e redireciona para download do arquivo
 */
router.get('/:token', async (req, res) => {
    const { token } = req.params;

    try {
        console.log('🔐 [Download] Tentativa de download com token:', token);

        // Buscar token no banco
        const downloadToken = await DownloadToken.findOne({ token });

        if (!downloadToken) {
            console.error('❌ [Download] Token não encontrado:', token);
            return res.status(404).json({
                error: 'Link inválido',
                message: 'Este link de download não existe ou é inválido.'
            });
        }

        // Verificar se token expirou
        if (new Date() > downloadToken.expiresAt) {
            console.error('⏰ [Download] Token expirado:', token);
            console.error('📅 [Download] Expirou em:', downloadToken.expiresAt);
            return res.status(403).json({
                error: 'Link expirado',
                message: 'Este link de download expirou. Entre em contato com o suporte se precisar de um novo link.'
            });
        }

        // Verificar se token já foi usado
        if (downloadToken.used) {
            console.error('🚫 [Download] Token já utilizado:', token);
            console.error('📅 [Download] Usado em:', downloadToken.usedAt);
            return res.status(403).json({
                error: 'Link já utilizado',
                message: 'Este link de download já foi utilizado. Cada link pode ser usado apenas uma vez.'
            });
        }

        // Marcar token como usado
        downloadToken.used = true;
        downloadToken.usedAt = new Date();
        await downloadToken.save();

        console.log('✅ [Download] Token validado com sucesso!');
        console.log('📧 [Download] Email:', downloadToken.userEmail);
        console.log('📦 [Download] Produto ID:', downloadToken.productId);
        console.log('🔗 [Download] Recurso original:', downloadToken.downloadUrl);

        let finalRedirectUrl = downloadToken.downloadUrl;

        // Se NÃO for uma URL completa (não começa com http), assumimos que é uma Key do R2
        if (!downloadToken.downloadUrl.startsWith('http')) {
            console.log('🔄 [Download] Detectada Key do R2. Gerando link assinado...');
            const { getDownloadLink } = require('../services/storageService');
            finalRedirectUrl = await getDownloadLink(downloadToken.downloadUrl);
        }

        console.log('🚀 [Download] Redirecionando para:', finalRedirectUrl);

        // Redirecionar para o arquivo de download
        return res.redirect(finalRedirectUrl);

    } catch (error) {
        console.error('❌ [Download] Erro ao processar token:', error);
        return res.status(500).json({
            error: 'Erro interno',
            message: 'Ocorreu um erro ao processar seu download. Tente novamente mais tarde.'
        });
    }
});

module.exports = router;
