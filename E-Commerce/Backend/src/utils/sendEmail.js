const nodemailer = require('nodemailer');

/**
 * Configura o transportador de e-mail usando o Nodemailer com as credenciais do Gmail.
 * As credenciais são carregadas a partir de variáveis de ambiente.
 */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Seu e-mail do Gmail
    pass: process.env.EMAIL_PASS, // Sua senha de aplicativo do Gmail
  },
});

/**
 * Envia um e-mail usando o transportador configurado.
 * @param {object} options - Opções do e-mail.
 * @param {string} options.to - O destinatário do e-mail.
 * @param {string} options.subject - O assunto do e-mail.
 * @param {string} options.html - O corpo do e-mail em formato HTML.
 */
const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('ERRO: Variáveis de ambiente EMAIL_USER ou EMAIL_PASS não definidas.');
    throw new Error('Configuração de e-mail incompleta.');
  }

  try {
    console.log(`Tentando enviar email para: ${to}`);
    console.log(`Usando conta: ${process.env.EMAIL_USER}`);

    const info = await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, html });
    console.log('Email enviado com sucesso para:', to);
    console.log('Message ID:', info.messageId);
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    throw error;
  }
};

module.exports = sendEmail;