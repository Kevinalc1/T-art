const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const fs = require('fs');

// Configuração do cliente S3 para Cloudflare R2
let endpoint = process.env.R2_ENDPOINT || '';

// 1. Garantir protocolo HTTPS
if (endpoint && !endpoint.startsWith('http')) {
    console.warn('⚠️  [R2 Config] Endpoint sem protocolo. Adicionando https://');
    endpoint = `https://${endpoint}`;
}

// 2. Remover bucket do endpoint se estiver presente (fix comum)
if (endpoint && endpoint.includes(`/${process.env.R2_BUCKET_NAME}`)) {
    console.warn('⚠️  [R2 Config] O endpoint contém o nome do bucket. Ajustando...');
    endpoint = endpoint.replace(`/${process.env.R2_BUCKET_NAME}`, '');
}

// 3. Garantir sufixo do R2 se o usuário informou apenas o ID da conta
if (endpoint && !endpoint.includes('.r2.cloudflarestorage.com')) {
    console.warn('⚠️  [R2 Config] Endpoint parece incompleto (apenas ID?). Adicionando domínio R2.');
    endpoint = `${endpoint}.r2.cloudflarestorage.com`;
}

console.log('✅ [R2 Config] Endpoint final:', endpoint);

const r2Client = new S3Client({
    region: 'auto',
    endpoint: endpoint,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true, // R2 OBRIGATÓRIO: Gera url https://endpoint/bucket/key
});

/**
 * Gera uma URL assinada (Presigned URL) para download seguro de um arquivo no R2.
 * @param {string} fileKey - O caminho/chave do arquivo no bucket (ex: 'vetores/imagem.zip').
 * @param {number} expiresIn - Tempo de validade do link em segundos (padrão 3600 = 1 hora).
 * @returns {Promise<string>} - A URL assinada para download.
 */
const generateSignedDownloadLink = async (fileKey, expiresIn = 3600) => {
    try {
        if (!fileKey) {
            throw new Error('File key is required');
        }

        const command = new GetObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: fileKey,
            ResponseContentDisposition: `attachment; filename="${fileKey.split('/').pop()}"`,
        });

        const signedUrl = await getSignedUrl(r2Client, command, { expiresIn });
        console.log('🔗 [R2] Signed URL gerada:', signedUrl);
        return signedUrl;

    } catch (error) {
        console.error('Erro ao gerar link assinado do R2:', error);
        throw new Error('Falha ao gerar link de download seguro: ' + error.message);
    }
};

/**
 * Faz upload de um arquivo para o Cloudflare R2
 * @param {object} file - Objeto do arquivo do Multer (com .path)
 * @param {string} fileName - O nome original do arquivo
 * @param {string} contentType - O tipo MIME do arquivo (opcional)
 * @returns {Promise<string>} - A Chave (Key) do arquivo no R2 para ser salva no banco
 */
const uploadFileToR2 = async (file, fileName, contentType = 'application/octet-stream') => {
    try {
        // Gerar uma chave única para evitar sobrescrita
        const timestamp = Date.now();
        const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
        const fileKey = `uploads/${timestamp}-${sanitizedFileName}`; // Pasta 'uploads'

        console.log(`📤 [R2] Iniciando upload: ${fileKey}`);

        const fileBuffer = fs.readFileSync(file.path);

        const command = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: fileKey,
            Body: fileBuffer,
            ContentType: contentType,
        });

        await r2Client.send(command);
        console.log(`✅ [R2] Upload concluído: ${fileKey}`);

        // Retornamos a KEY, pois é isso que o generateSignedDownloadLink precisa.
        // Não retornamos URL pública porque a ideia é ser privado.
        return fileKey;

    } catch (error) {
        console.error('❌ [R2] Erro no upload:', error);
        throw new Error(`Falha no upload para R2: ${error.message}`);
    } finally {
        if (file.path && fs.existsSync(file.path)) {
            try {
                fs.unlinkSync(file.path);
                console.log('🗑️ [Temp] Arquivo removido do disco (R2 Upload):', file.path);
            } catch (cleanupErr) {
                console.error('⚠️ [Temp] Erro ao remover arquivo temporário (R2 Upload):', cleanupErr);
            }
        }
    }
};

module.exports = {
    generateSignedDownloadLink,
    getDownloadLink: generateSignedDownloadLink,
    uploadFileToR2,
};
