require('dotenv').config();
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

async function debugR2() {
    console.log('--- DIAGNÓSTICO R2 START ---');
    console.log('Checking Environment Variables...');
    console.log('R2_ENDPOINT:', process.env.R2_ENDPOINT ? 'DEFINED' : 'MISSING');
    console.log('R2_BUCKET_NAME:', process.env.R2_BUCKET_NAME ? 'DEFINED' : 'MISSING');
    console.log('R2_ACCESS_KEY_ID:', process.env.R2_ACCESS_KEY_ID ? 'DEFINED' : 'MISSING');
    console.log('R2_SECRET_ACCESS_KEY:', process.env.R2_SECRET_ACCESS_KEY ? 'DEFINED' : 'MISSING');

    if (!process.env.R2_ENDPOINT || !process.env.R2_ACCESS_KEY_ID) {
        console.error('❌ ERRO: Variáveis de ambiente R2 faltando!');
        return;
    }

    let endpoint = process.env.R2_ENDPOINT;
    // Replica logic from storageService.js
    if (endpoint && endpoint.endsWith(`/${process.env.R2_BUCKET_NAME}`)) {
        console.log('⚠️  Endpoint has bucket name, stripping it...');
        endpoint = endpoint.replace(`/${process.env.R2_BUCKET_NAME}`, '');
    }

    const r2Client = new S3Client({
        region: 'us-east-1',
        endpoint: endpoint,
        credentials: {
            accessKeyId: process.env.R2_ACCESS_KEY_ID,
            secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
        },
        forcePathStyle: true,
    });

    console.log('Attempting upload...');
    try {
        const fileKey = `debug-test-${Date.now()}.txt`;
        const command = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: fileKey,
            Body: 'Debug content',
            ContentType: 'text/plain',
        });

        await r2Client.send(command);
        console.log(`✅ SUCCESS! Uploaded ${fileKey}`);
    } catch (err) {
        console.error('❌ Failed to upload:', err);
        console.error('Name:', err.name);
        console.error('Message:', err.message);
        if (err.$metadata) console.error('Metadata:', err.$metadata);
    }
    console.log('--- DIAGNÓSTICO R2 END ---');
}

debugR2();
