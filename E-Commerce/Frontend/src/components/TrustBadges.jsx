import React from 'react';
import { FaLock, FaCreditCard, FaWhatsapp, FaBolt } from 'react-icons/fa';
import { SiPix } from 'react-icons/si';
import './TrustBadges.css';

const TrustBadges = () => {
    const badges = [
        {
            icon: <FaLock />,
            text: 'Compra 100% Segura'
        },
        {
            icon: <SiPix />,
            text: 'Pix Instantâneo'
        },
        {
            icon: <FaCreditCard />,
            text: 'Cartão de Crédito'
        },
        {
            icon: <FaBolt />,
            text: 'Entrega Imediata'
        },
        {
            icon: <FaWhatsapp />,
            text: 'Suporte via WhatsApp'
        }
    ];

    return (
        <div className="trust-badges">
            <h3>🔒 Compra Segura e Garantida</h3>
            <div className="trust-badges-grid">
                {badges.map((badge, index) => (
                    <div key={index} className="trust-badge-item">
                        <div className="trust-badge-icon">
                            {badge.icon}
                        </div>
                        <span className="trust-badge-text">{badge.text}</span>
                    </div>
                ))}
            </div>
            <div className="trust-guarantee">
                <p>✅ Recebimento imediato via e-mail após confirmação do pagamento</p>
            </div>
        </div>
    );
};

export default TrustBadges;
