import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import './NewsletterPopup.css';

const API_URL = import.meta.env.VITE_API_URL;

const NewsletterPopup = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        // Verificar se usuário já viu o popup
        const hasSeenPopup = localStorage.getItem('newsletterPopupSeen');
        if (hasSeenPopup) return;

        // Mostrar após 15 segundos
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 15000);

        // Exit intent - detectar quando mouse sai da página
        const handleMouseLeave = (e) => {
            if (e.clientY <= 0 && !hasSeenPopup) {
                setIsVisible(true);
            }
        };

        document.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            clearTimeout(timer);
            document.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        localStorage.setItem('newsletterPopupSeen', 'true');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch(`${API_URL}/api/subscribers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    name,
                    source: 'popup',
                    incentive: '10% desconto na primeira compra'
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setIsSuccess(true);
                localStorage.setItem('newsletterPopupSeen', 'true');

                // Fechar após 3 segundos
                setTimeout(() => {
                    setIsVisible(false);
                }, 3000);
            } else {
                alert(data.error || 'Erro ao cadastrar. Tente novamente.');
            }
        } catch (error) {
            console.error('Erro ao enviar:', error);
            alert('Erro ao processar sua inscrição. Tente novamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isVisible) return null;

    return (
        <div className="newsletter-popup-overlay" onClick={handleClose}>
            <div className="newsletter-popup" onClick={(e) => e.stopPropagation()}>
                <button className="popup-close" onClick={handleClose} aria-label="Fechar">
                    <FaTimes />
                </button>

                {!isSuccess ? (
                    <>
                        <div className="popup-header">
                            <div className="popup-icon">🎁</div>
                            <h2>Ganhe 10% de Desconto!</h2>
                            <p>Cadastre-se e receba artes exclusivas + cupom de desconto</p>
                        </div>

                        <div className="popup-body">
                            <ul className="popup-benefits">
                                <li>Acesso antecipado a novas coleções</li>
                                <li>Cupons de desconto exclusivos</li>
                                <li>Dicas de sublimação e design</li>
                                <li>Artes grátis todo mês</li>
                            </ul>

                            <form className="popup-form" onSubmit={handleSubmit}>
                                <input
                                    type="text"
                                    className="popup-input"
                                    placeholder="Seu nome"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                                <input
                                    type="email"
                                    className="popup-input"
                                    placeholder="Seu melhor e-mail"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <button
                                    type="submit"
                                    className="popup-submit"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Cadastrando...' : 'Quero Meu Desconto!'}
                                </button>
                            </form>

                            <p className="popup-privacy">
                                🔒 Seus dados estão seguros. Sem spam, apenas conteúdo de valor.
                            </p>
                        </div>
                    </>
                ) : (
                    <div className="popup-success">
                        <div className="popup-success-icon">✅</div>
                        <h3>Parabéns!</h3>
                        <p>Você receberá seu cupom de 10% de desconto no e-mail em instantes.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NewsletterPopup;
