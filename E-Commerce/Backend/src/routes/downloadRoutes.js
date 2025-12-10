const express = require('express');
const router = express.Router();
const DownloadToken = require('../models/DownloadToken');

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
        console.log('🔗 [Download] Redirecionando para:', downloadToken.downloadUrl);

        // Redirecionar para o arquivo no Cloudinary
        return res.redirect(downloadToken.downloadUrl);

    } catch (error) {
        console.error('❌ [Download] Erro ao processar token:', error);
        return res.status(500).json({
            error: 'Erro interno',
            message: 'Ocorreu um erro ao processar seu download. Tente novamente mais tarde.'
        });
    }
});

module.exports = router;
