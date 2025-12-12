const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// Configuração do cliente S3 para Cloudflare R2
// CORREÇÃO DE SEGURANÇA: Remover o nome do bucket do endpoint se o usuário tiver colocado errado no .env
let endpoint = process.env.R2_ENDPOINT;
if (endpoint && endpoint.endsWith(`/${process.env.R2_BUCKET_NAME}`)) {
    console.warn('⚠️  AVISO: R2_ENDPOINT continha o nome do bucket. Ajustando automaticamente...');
    endpoint = endpoint.replace(`/${process.env.R2_BUCKET_NAME}`, '');
}

const r2Client = new S3Client({
    region: 'us-east-1', // AWS SDK compatibilidade para R2
    endpoint: endpoint,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true, // R2 requer isso para conexões via endpoint customizado
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
        return signedUrl;

    } catch (error) {
        console.error('Erro ao gerar link assinado do R2:', error);
        throw new Error('Falha ao gerar link de download seguro: ' + error.message);
    }
};

/**
 * Faz upload de um arquivo para o Cloudflare R2
 * @param {Buffer} fileBuffer - O conteúdo do arquivo em buffer
 * @param {string} fileName - O nome original do arquivo
 * @param {string} contentType - O tipo MIME do arquivo (opcional)
 * @returns {Promise<string>} - A Chave (Key) do arquivo no R2 para ser salva no banco
 */
const uploadFileToR2 = async (fileBuffer, fileName, contentType = 'application/octet-stream') => {
    try {
        // Gerar uma chave única para evitar sobrescrita
        const timestamp = Date.now();
        const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
        const fileKey = `uploads/${timestamp}-${sanitizedFileName}`; // Pasta 'uploads'

        console.log(`📤 [R2] Iniciando upload: ${fileKey}`);

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
    }
};

module.exports = {
    generateSignedDownloadLink,
    getDownloadLink: generateSignedDownloadLink,
    uploadFileToR2,
};
