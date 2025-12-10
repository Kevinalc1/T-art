import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './DownloadPage.css';

const API_URL = import.meta.env.VITE_API_URL;

export default function DownloadPage() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('loading'); // loading, success, error
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const processDownload = async () => {
            if (!token) {
                setStatus('error');
                setErrorMessage('Token de download inválido.');
                return;
            }

            try {
                console.log('🔐 [Download] Processando token:', token);

                // Fazer requisição para validar token
                const response = await fetch(`${API_URL}/api/download/${token}`);

                if (response.ok) {
                    // Token válido - redirecionar para o arquivo
                    console.log('✅ [Download] Token válido! Redirecionando...');
                    setStatus('success');

                    // Aguardar 1 segundo antes de redirecionar
                    setTimeout(() => {
                        window.location.href = response.url;
                    }, 1000);
                } else {
                    // Token inválido, expirado ou já usado
                    const data = await response.json();
                    console.error('❌ [Download] Erro:', data.error);

                    setStatus('error');
                    setErrorMessage(data.message || 'Não foi possível processar seu download.');
                }
            } catch (error) {
                console.error('❌ [Download] Erro de rede:', error);
                setStatus('error');
                setErrorMessage('Erro de conexão. Verifique sua internet e tente novamente.');
            }
        };

        processDownload();
    }, [token]);

    const handleBackToHome = () => {
        navigate('/');
    };

    const handleContactSupport = () => {
        navigate('/contato');
    };

    return (
        <div className="download-page">
            <div className="download-container">
                {status === 'loading' && (
                    <div className="download-status loading">
                        <div className="spinner"></div>
                        <h1>Validando seu link...</h1>
                        <p>Aguarde enquanto verificamos seu download.</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="download-status success">
                        <div className="icon-success">✓</div>
                        <h1>Download Autorizado!</h1>
                        <p>Você será redirecionado para o arquivo em instantes...</p>
                        <div className="progress-bar">
                            <div className="progress-fill"></div>
                        </div>
                    </div>
                )}

                {status === 'error' && (
                    <div className="download-status error">
                        <div className="icon-error">✕</div>
                        <h1>Não foi possível processar o download</h1>
                        <p className="error-message">{errorMessage}</p>

                        <div className="error-help">
                            <h3>Possíveis causas:</h3>
                            <ul>
                                <li>O link expirou (válido por 24 horas)</li>
                                <li>O link já foi utilizado</li>
                                <li>O link está incorreto ou inválido</li>
                            </ul>
                        </div>

                        <div className="action-buttons">
                            <button onClick={handleContactSupport} className="btn-primary">
                                Falar com Suporte
                            </button>
                            <button onClick={handleBackToHome} className="btn-secondary">
                                Voltar para Início
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
