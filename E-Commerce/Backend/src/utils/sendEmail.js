const nodemailer = require('nodemailer');

// --- MAPA DE PRODUTOS (DEBUG/FALLBACK) ---
// COLE AQUI SEUS IDs REAIS DO MONGODB E LINKS DO CLOUDINARY
// FORMATO: 'ID_DO_PRODUTO': 'LINK_DO_CLOUDINARY',
const PRODUCT_LINKS = {
  // Exemplo: '6755e1a3cc767566d5af1234': 'https://res.cloudinary.com/.../arquivo.zip',
  // Adicione seus produtos abaixo:
};

// --- CONFIGURAÇÃO DO TRANSPORTADOR ---
// Forçando configurações para Gmail (SSL/465)
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // true para 465, false para outras portas
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD // Suporte para ambas as variaveis
  }
});

// --- VERIFICAÇÃO DE CONEXÃO (NO INÍCIO) ---
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ ERRO CRÍTICO: Não foi possível conectar ao Gmail. Verifique EMAIL_USER/PASS.');
    console.error('Detalhes do erro:', error);
  } else {
    console.log('✅ Conexão SMTP com Gmail estabelecida com sucesso.');
  }
});

/**
 * Envia um e-mail genérico (usado para confirmações gerais).
 */
const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.EMAIL_USER || (!process.env.EMAIL_PASS && !process.env.EMAIL_PASSWORD)) {
    console.error('❌ ERRO: Variáveis de ambiente EMAIL_USER ou EMAIL_PASS não definidas.');
    throw new Error('Configuração de e-mail incompleta.');
  }

  try {
    console.log(`📩 Tentando enviar e-mail para ${to}...`);

    // Sender DEVE ser igual ao usuário autenticado para evitar bloqueios
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ E-mail enviado! ID: ${info.messageId} Response: ${info.response}`);
    return info;
  } catch (error) {
    console.error(`❌ ERRO FATAL ao enviar e-mail para ${to}:`, error);
    throw error;
  }
};

/**
 * Envia e-mail com botão para download.
 * Agora aceita productId para buscar no mapa de fallback se necessário.
 */
const enviarEmailDownload = async (email, nomeProduto, linkCloudinary, productId = null) => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD;

  if (!user || !pass) {
    console.error('❌ ERRO: Credenciais de e-mail (EMAIL_USER / EMAIL_PASS) não definidas.');
    return;
  }

  try {
    console.log(`📩 Iniciando envio de e-mail de download para: ${email}`);

    let finalLink = linkCloudinary;

    // Se tiver ID, verifica no mapa de debug/fallback
    if (productId) {
      console.log(`🔍 Buscando link para o produto ID: ${productId}`);
      if (PRODUCT_LINKS[productId]) {
        console.log('✅ Link encontrado no MAPA (substituindo o original).');
        finalLink = PRODUCT_LINKS[productId];
      } else {
        console.log('⚠️ ID não encontrado no mapa manual. Usando link original.');
      }
    }

    if (!finalLink) {
      console.warn('⚠️ AVISO: Nenhum link de download disponível para este produto. Enviando e-mail de contato.');
      finalLink = "#"; // Evita quebra, mas idealmente deveria ser tratado
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Seu Produto da T-art Chegou!',
      html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #333;">Obrigado pela sua compra!</h2>
                <p>Você adquiriu: <strong>${nomeProduto}</strong></p>
                <p>Clique no botão abaixo para baixar seu arquivo:</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${finalLink}" style="background-color: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">BAIXAR ARQUIVO</a>
                </div>
                <p style="font-size: 12px; color: #888;">Se o botão não funcionar, copie e cole este link no seu navegador: <br> ${finalLink}</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p>Atenciosamente,<br>Equipe T-art</p>
              </div>
            `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ E-mail de download enviado com sucesso! ID: ${info.messageId}`);
    return info;

  } catch (error) {
    console.error('❌ ERRO FATAL ao enviar e-mail de download:', error);
    throw error;
  }
};

module.exports = { sendEmail, enviarEmailDownload };