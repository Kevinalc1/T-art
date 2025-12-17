const { createClient } = require('@supabase/supabase-js');
const multer = require('multer');


// Inicializar cliente Supabase (Com verificação de segurança)
let supabase;

if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
        supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );
        console.log('✅ Supabase configurado com sucesso.');
    } catch (err) {
        console.error('❌ Erro ao inicializar Supabase:', err.message);
    }
} else {
    console.warn('⚠️  AVISO: Variáveis do Supabase não encontradas (SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY).');
    console.warn('⚠️  O upload de arquivos via Supabase não funcionará.');

    // Mock para evitar crash ao importar, mas falhar ao usar
    supabase = {
        storage: {
            from: () => ({
                upload: async () => { throw new Error('Supabase não configurado.'); },
                getPublicUrl: () => ({ data: { publicUrl: null } })
            })
        }
    };
}

// Configuração do Multer para armazenar em DISCO (evita OOM)
const fs = require('fs');
const path = require('path');

const uploadDir = '/tmp/uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

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
    limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
    fileFilter: (req, file, cb) => {
        // Aceitar qualquer tipo de arquivo
        cb(null, true);
    }
});

/**
 * Faz upload de um arquivo para o Supabase Storage
 * @param {object} file - Objeto do arquivo do Multer (com .path)
 * @param {string} fileName - Nome do arquivo
 * @param {string} bucket - Nome do bucket no Supabase
 * @param {string} folder - Pasta dentro do bucket
 * @param {string} contentType - MIME type do arquivo
 * @returns {Promise<string>} - URL pública do arquivo
 */
async function uploadToSupabase(file, fileName, bucket, folder, contentType) {
    if (!process.env.SUPABASE_URL) {
        throw new Error('Supabase não está configurado. Verifique o arquivo .env.');
    }

    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${folder}/${timestamp}-${sanitizedFileName}`;

    console.log(`📤 [Supabase] Fazendo upload: ${filePath}`);

    try {
        const fileContent = fs.readFileSync(file.path);

        // Upload do arquivo
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(filePath, fileContent, {
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
    } finally {
        // SEMPRE apagar o arquivo temporário
        if (file.path && fs.existsSync(file.path)) {
            try {
                fs.unlinkSync(file.path);
                console.log('🗑️ [Temp] Arquivo removido do disco:', file.path);
            } catch (cleanupErr) {
                console.error('⚠️ [Temp] Erro ao remover arquivo temporário:', cleanupErr);
            }
        }
    }
}

module.exports = {
    supabase,
    uploadImage,
    uploadFile,
    uploadToSupabase,
};
