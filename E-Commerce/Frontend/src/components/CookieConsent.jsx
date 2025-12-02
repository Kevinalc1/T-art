import React, { useState, useEffect } from 'react';
import './CookieConsent.css';

export default function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookieConsent');
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookieConsent', 'true');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="cookie-consent-banner">
            <div className="cookie-content">
                <p>
                    Nós utilizamos cookies para melhorar sua experiência de navegação e analisar o tráfego do site.
                    Ao continuar navegando, você concorda com a nossa <a href="/privacidade">Política de Privacidade</a>.
                </p>
                <button onClick={handleAccept} className="btn-accept-cookies">
                    Aceitar e Fechar
                </button>
            </div>
        </div>
    );
}
