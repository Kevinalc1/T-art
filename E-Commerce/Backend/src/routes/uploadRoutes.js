const express = require('express');
const router = express.Router();
const multer = require('multer');
const { cloudinary, imageStorage, fileStorage } = require('../config/cloudinary');

// Upload para IMAGENS (jpg, png, jpeg, webp)
const uploadImage = multer({
    storage: imageStorage,
    limits: { fileSize: 10 * 1024 * 1024 } // Limite de 10MB para imagens
});

// Upload para ARQUIVOS (cdr, zip, pdf, ai, psd, etc)
const uploadFile = multer({
    storage: fileStorage,
    limits: { fileSize: 100 * 1024 * 1024 } // Limite de 100MB para arquivos
});

// @desc    Upload de arquivo genérico para Cloudinary
// @route   POST /api/upload
// @access  Public
router.post('/', uploadFile.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Nenhum arquivo enviado' });
        }

        console.log('✅ [Upload] Arquivo enviado para Cloudinary:', req.file.path);

        // Cloudinary retorna a URL completa em req.file.path
        res.send({
            message: 'Upload realizado com sucesso',
            filePath: req.file.path, // URL completa do Cloudinary
            fileName: req.file.filename,
            publicId: req.file.filename
        });
    } catch (error) {
        console.error('❌ [Upload] Erro no upload:', error);
        res.status(500).json({ message: 'Erro ao fazer upload do arquivo' });
    }
});

module.exports = router;
