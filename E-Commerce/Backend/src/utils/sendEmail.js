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

// Mapeamento removido (agora busca no MongoDB)

/**
 * Envia e-mail com botão para download.
 */
const enviarEmailDownload = async (email, nomeProduto, linkCloudinary) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('ERRO: Credenciais de e-mail não configuradas.');
    throw new Error('Configuração de servidor incompleta.');
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
          <a href="${linkCloudinary}" style="background-color: #007bff; color: public; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">BAIXAR ARQUIVO</a>
        </div>
        <p style="font-size: 12px; color: #888;">Se o botão não funcionar, copie e cole este link no seu navegador: <br> ${linkCloudinary}</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p>Atenciosamente,<br>Equipe T-art</p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`E-mail de download enviado para ${email}. ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Erro ao enviar e-mail de download:', error);
    throw error;
  }
};

module.exports = { sendEmail, enviarEmailDownload };