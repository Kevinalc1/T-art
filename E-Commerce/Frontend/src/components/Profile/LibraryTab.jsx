import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaDownload, FaFileImage, FaCalendar, FaReceipt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../../context/CurrencyContext.jsx';
import './ProfileTabs.css';

export default function LibraryTab() {
    const { t } = useTranslation();
    const { formatPrice } = useCurrency();
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchPedidos = async () => {
            try {
                const token = localStorage.getItem('userToken');
                const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/pedidos/meus-pedidos`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPedidos(data);
            } catch (err) {
                console.error('Erro ao buscar pedidos:', err);
                setError('Não foi possível carregar seus pedidos.');
            } finally {
                setLoading(false);
            }
        };

        fetchPedidos();
    }, []);

    const filteredPedidos = pedidos.map(pedido => ({
        ...pedido,
        items: pedido.items.filter(item =>
            item.productName.toLowerCase().includes(searchTerm.toLowerCase())
        )
    })).filter(pedido => pedido.items.length > 0);

    const handleDownload = async (item, pedidoId) => {
        try {
            toast.info('Gerando link de download seguro...');
            const token = localStorage.getItem('userToken');

            const idDoProduto = typeof item.productId === 'object' ? item.productId?._id : item.productId;

            if (!idDoProduto) {
                toast.error('Produto não encontrado ou removido.');
                return;
            }

            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/download/secure`,
                { productId: idDoProduto },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data && response.data.downloadUrl) {
                const link = document.createElement('a');
                link.href = response.data.downloadUrl;
                link.setAttribute('download', item.productName || 'download');
                document.body.appendChild(link);
                link.click();
                link.remove();
                toast.success('Download iniciado!');
            } else {
                throw new Error('Url de download não retornada pelo servidor');
            }

        } catch (err) {
            console.error('Erro ao baixar arquivo:', err);
            const msg = err.response?.data?.message || 'Erro ao gerar link de download.';
            toast.error(msg);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(); // Browser locale
    };

    if (loading) return <div className="loading-spinner">Carregando...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="library-tab">
            <h2>{t('profile.biblioteca')}</h2>

            <div className="library-search">
                <input
                    type="text"
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

            {filteredPedidos.length === 0 ? (
                <p className="empty-state">
                    {searchTerm ? 'Nenhum item encontrado.' : t('profile.nenhumPedido')}
                </p>
            ) : (
                <div className="pedidos-list">
                    {filteredPedidos.map(pedido => (
                        <div key={pedido._id} className="pedido-card">
                            <div className="pedido-header">
                                <div className="pedido-info">
                                    <h3>
                                        <FaReceipt /> #{pedido._id.slice(-8).toUpperCase()}
                                    </h3>
                                    <div className="pedido-meta">
                                        <span className="pedido-date">
                                            <FaCalendar /> {formatDate(pedido.createdAt)}
                                        </span>
                                        <span className="pedido-total">
                                            Total: <strong>{formatPrice(pedido.totalPrice)}</strong>
                                        </span>
                                        <span className={`pedido-status ${pedido.isPaid ? 'paid' : 'pending'}`}>
                                            {pedido.isPaid ? '✓ Pago' : 'Pendente'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="pedido-items">
                                {pedido.items.map((item, index) => {
                                    const productImg = item.productId?.imageUrls?.[0] || null;

                                    return (
                                        <div key={index} className="library-card">
                                            <div className="card-thumb">
                                                {productImg ? (
                                                    <img src={productImg} alt={item.productName} />
                                                ) : (
                                                    <div className="no-image-placeholder">
                                                        <FaFileImage size={24} color="#ccc" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="card-content">
                                                <h4>{item.productName}</h4>
                                                <div className="item-details">
                                                    <span className="item-price">{formatPrice(item.price)}</span>
                                                    <span className="item-quantity">Qtd: {item.quantidade}</span>
                                                </div>
                                                <div className="download-actions">
                                                    <button
                                                        onClick={() => handleDownload(item, pedido._id)}
                                                        className="btn-download primary"
                                                        disabled={!item.downloadUrl}
                                                    >
                                                        <FaDownload /> {t('profile.fazerDownload')}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
