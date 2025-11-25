const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuração do armazenamento
const storage = multer.diskStorage({
    destination(req, file, cb) {
        const uploadPath = 'uploads/';
        // Garante que a pasta existe
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename(req, file, cb) {
        // Nome do arquivo: campo + data + extensão original
        cb(
            null,
            `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
        );
    },
});

// Filtro de arquivo (opcional - pode ajustar conforme necessidade)
// Por enquanto aceita tudo, já que é para "Download File" (zip, rar, pdf, etc.)
const upload = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 } // Limite de 100MB (ajuste conforme necessário)
});

// @desc    Upload de arquivo
// @route   POST /api/upload
// @access  Public (ou Private, dependendo da necessidade. Por enquanto Public para facilitar)
router.post('/', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Nenhum arquivo enviado' });
        }

        // Retorna o caminho do arquivo. 
        // Nota: Em produção, você provavelmente vai querer retornar uma URL completa ou relativa servida estaticamente.
        // Ex: /uploads/filename.ext
        res.send({
            message: 'Upload realizado com sucesso',
            filePath: `/${req.file.path.replace(/\\/g, '/')}`, // Normaliza barras para URL
            fileName: req.file.filename
        });
    } catch (error) {
        console.error('Erro no upload:', error);
        res.status(500).json({ message: 'Erro ao fazer upload do arquivo' });
    }
});

module.exports = router;
