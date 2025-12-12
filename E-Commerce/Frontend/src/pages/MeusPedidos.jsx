import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useCurrency } from '../context/CurrencyContext.jsx';
import { toast } from 'react-toastify';
import './ProfilePage.css'; // Reusing existing styles for now

const API_URL = import.meta.env.VITE_API_URL;

export default function MeusPedidos() {
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { token } = useAuth();
    const { formatPrice } = useCurrency();

    useEffect(() => {
        const fetchPedidos = async () => {
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`${API_URL}/api/pedidos/meus-pedidos`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Falha ao buscar os pedidos. Tente recarregar a página.');
                }

                const data = await response.json();
                setPedidos(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPedidos();
    }, [token]);

    const formatarData = (dataString) => new Date(dataString).toLocaleDateString('pt-BR');

    const handleDownload = async (productId, fileName) => {
        try {
            toast.info('Gerando link de download seguro...');
            const response = await fetch(`${API_URL}/api/download/secure`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ productId })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro ao gerar link de download');
            }

            // Criar um link temporário e clicar nele para forçar o download
            const link = document.createElement('a');
            link.href = data.downloadUrl;
            link.setAttribute('download', fileName || 'download'); // Opcional, R2 já manda header
            document.body.appendChild(link);
            link.click();
            link.remove();

            toast.success('Download iniciado!');

        } catch (error) {
            console.error('Erro no download:', error);
            toast.error(error.message);
        }
    };

    return (
        <div className="profile-content">
            <h1>Meus Pedidos</h1>
            {loading && <p>Carregando seus pedidos...</p>}
            {error && <p className="error-message">{error}</p>}
            {!loading && !error && (
                pedidos.length === 0 ? (
                    <p>Você ainda não fez nenhum pedido.</p>
                ) : (
                    <div className="lista-pedidos">
                        {pedidos.map((pedido) => (
                            <div key={pedido._id} className="pedido">
                                <div className="pedido-header">
                                    <span>Pedido de {formatarData(pedido.createdAt)}</span>
                                    <span>Total: <strong>{formatPrice(pedido.totalPrice)}</strong></span>
                                </div>
                                <div className="pedido-body">
                                    {pedido.items.map((item, index) => (
                                        <div key={index} className="pedido-item">
                                            <span>{item.productName}</span>
                                            <button
                                                onClick={() => handleDownload(item.product._id || item.product, item.productName)}
                                                className="btn-download"
                                            >
                                                Baixar
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}
        </div>
    );
}
