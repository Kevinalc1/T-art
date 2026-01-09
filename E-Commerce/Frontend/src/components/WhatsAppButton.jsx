import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import './WhatsAppButton.css';

const WhatsAppButton = () => {
    const phoneNumber = '5511999999999'; // Substitua pelo seu número com código do país
    const message = 'Olá! Gostaria de tirar uma dúvida sobre as artes para sublimação.';

    const handleClick = () => {
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
    };

    return (
        <button
            className="whatsapp-button"
            onClick={handleClick}
            aria-label="Falar no WhatsApp"
            title="Falar no WhatsApp"
        >
            <span className="whatsapp-tooltip">Tire suas dúvidas!</span>
            <FaWhatsapp />
        </button>
    );
};

export default WhatsAppButton;
