import React from 'react';
import { FaWhatsapp, FaEnvelope } from 'react-icons/fa';
import './ProfileTabs.css';

export default function SupportTab() {
    return (
        <div className="support-tab">
            <h2>Central de Ajuda</h2>
            <p>Teve algum problema com um arquivo? Estamos aqui para ajudar.</p>

            <div className="support-options">
                <div className="support-card">
                    <FaWhatsapp className="support-icon whatsapp" />
                    <h3>Suporte via WhatsApp</h3>
                    <p>Atendimento rápido para dúvidas urgentes.</p>
                    <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer" className="btn-support">
                        Iniciar Conversa
                    </a>
                </div>

                <div className="support-card">
                    <FaEnvelope className="support-icon email" />
                    <h3>Suporte por E-mail</h3>
                    <p>Para questões mais detalhadas ou envio de prints.</p>
                    <a href="mailto:suporte@t-art.com" className="btn-support">
                        Enviar E-mail
                    </a>
                </div>
            </div>

            <div className="faq-section">
                <h3>Perguntas Frequentes</h3>
                <details>
                    <summary>O arquivo veio corrompido, o que fazer?</summary>
                    <p>Tente baixar novamente usando uma conexão estável. Se o erro persistir, entre em contato conosco informando o ID do pedido.</p>
                </details>
                <details>
                    <summary>Como abro arquivos .AI ou .PSD?</summary>
                    <p>Você precisará de softwares como Adobe Illustrator ou Photoshop. Se não tiver, use o arquivo .PNG incluído ou conversores online.</p>
                </details>
            </div>
        </div>
    );
}
