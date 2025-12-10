const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage para IMAGENS (jpg, png, jpeg, webp)
const imageStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 't-art-products/images',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    },
});

// Storage para ARQUIVOS (cdr, zip, pdf, ai, psd, etc)
const fileStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 't-art-products/files',
        resource_type: 'raw', // Importante para arquivos não-imagem
        allowed_formats: ['cdr', 'zip', 'rar', 'pdf', 'ai', 'psd', 'eps', 'svg'],
    },
});

module.exports = {
    cloudinary,
    imageStorage,
    fileStorage,
};
