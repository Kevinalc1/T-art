const { createClient } = require('@supabase/supabase-js');
const multer = require('multer');

// Inicializar cliente Supabase
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY // Service Role Key para bypass RLS
);

// Configuração do Multer para armazenar em memória
const storage = multer.memoryStorage();

// Upload para IMAGENS
const uploadImage = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Tipo de arquivo não permitido. Use: jpg, png, webp'));
        }
    }
});

// Upload para ARQUIVOS (.cdr, .zip, .pdf, etc)
const uploadFile = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB (limite do Supabase Free)
    fileFilter: (req, file, cb) => {
        // Aceitar qualquer tipo de arquivo
        cb(null, true);
    }
});

/**
 * Faz upload de um arquivo para o Supabase Storage
 * @param {Buffer} fileBuffer - Buffer do arquivo
 * @param {string} fileName - Nome do arquivo
 * @param {string} bucket - Nome do bucket no Supabase
 * @param {string} folder - Pasta dentro do bucket
 * @param {string} contentType - MIME type do arquivo
 * @returns {Promise<string>} - URL pública do arquivo
 */
async function uploadToSupabase(fileBuffer, fileName, bucket, folder, contentType) {
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${folder}/${timestamp}-${sanitizedFileName}`;

    console.log(`📤 [Supabase] Fazendo upload: ${filePath}`);

    // Upload do arquivo
    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, fileBuffer, {
            contentType: contentType,
            cacheControl: '3600',
            upsert: false
        });

    if (error) {
        console.error('❌ [Supabase] Erro no upload:', error);
        throw new Error(`Erro ao fazer upload: ${error.message}`);
    }

    console.log('✅ [Supabase] Upload concluído:', data.path);

    // Obter URL pública
    const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

    const publicUrl = publicUrlData.publicUrl;
    console.log('🔗 [Supabase] URL pública:', publicUrl);

    return publicUrl;
}

module.exports = {
    supabase,
    uploadImage,
    uploadFile,
    uploadToSupabase,
};
