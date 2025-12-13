const fs = require('fs');
const path = require('path');

async function testUploadRoute() {
    console.log('--- TESTE DE ROTA /api/upload START ---');

    const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
    const content = 'Conteúdo de teste para upload via rota';
    const filename = 'teste-rota.txt';
    const contentType = 'text/plain';

    // Construct the multipart body manually to avoid external dependencies like form-data
    let body = `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="file"; filename="${filename}"\r\n`;
    body += `Content-Type: ${contentType}\r\n\r\n`;
    body += `${content}\r\n`;
    body += `--${boundary}--\r\n`;

    try {
        console.log('Enviando POST para http://localhost:4000/api/upload...');

        const response = await fetch('http://localhost:4000/api/upload', {
            method: 'POST',
            headers: {
                'Content-Type': `multipart/form-data; boundary=${boundary}`
            },
            body: body
        });

        const text = await response.text();
        console.log('✅ Status:', response.status);
        console.log('✅ Body:', text);

    } catch (error) {
        console.error('❌ Falha na requisição:', error.message);
    }
    console.log('--- TESTE DE ROTA END ---');
}

testUploadRoute();
