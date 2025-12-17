const express = require('express');
const router = express.Router();
const { uploadImage, uploadFile, uploadToSupabase } = require('../config/supabase');

// @desc    Upload de IMAGEM para Supabase Storage
// @route   POST /api/upload/image
// @access  Public
router.post('/image', uploadImage.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Nenhuma imagem enviada' });
        }

        console.log('📤 [Upload] Enviando imagem para Supabase...');

        // Upload para Supabase
        const fileUrl = await uploadToSupabase(
            req.file,
            req.file.originalname,
            'produtos', // Nome do bucket
            'images',   // Pasta dentro do bucket
            req.file.mimetype
        );

        console.log('✅ [Upload] Imagem enviada com sucesso!');

        res.send({
            message: 'Upload de imagem realizado com sucesso',
            filePath: fileUrl,
            fileName: req.file.originalname
        });
    } catch (error) {
        console.error('❌ [Upload] Erro ao enviar imagem:', error);
        res.status(500).json({
            message: 'Erro ao fazer upload da imagem',
            error: error.message
        });
    }
});

const { uploadFileToR2 } = require('../services/storageService');

// @desc    Upload de ARQUIVO (.cdr, .zip, etc) para Cloudflare R2 (Download Seguro)
// @route   POST /api/upload (ou /api/upload/file)
// @access  Public
router.post(['/', '/file'], uploadFile.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Nenhum arquivo enviado' });
        }

        console.log('📤 [Upload] Enviando arquivo para Cloudflare R2 (Seguro)...');
        console.log(`📦 [Arquivo] Nome: ${req.file.originalname}`);
        console.log(`📊 [Tamanho] ${(req.file.size / 1024 / 1024).toFixed(2)} MB`);

        // Upload para R2
        const fileKey = await uploadFileToR2(
            req.file,
            req.file.originalname,
            req.file.mimetype
        );

        console.log('✅ [Upload] Arquivo enviado para R2 com sucesso!');
        console.log('🔑 [R2 Key]:', fileKey);

        res.send({
            message: 'Upload de arquivo realizado com sucesso (R2)',
            filePath: fileKey, // Retorna a Key, que é o que o frontend deve salvar no campo 'downloadUrl' ou 'vectorUrl'
            fileName: req.file.originalname,
            storage: 'r2'
        });
    } catch (error) {
        console.error('❌ [Upload] Erro ao enviar arquivo para R2:', error);
        res.status(500).json({
            message: 'Erro ao fazer upload do arquivo',
            error: error.message
        });
    }
});

module.exports = router;
