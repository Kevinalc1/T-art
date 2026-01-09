import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaDownload, FaFileImage, FaSearch, FaCloudDownloadAlt, FaQuestionCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../../context/CurrencyContext.jsx';
import './ProfileTabs.css';

export default function LibraryTab() {
    const { t } = useTranslation();
    const { formatPrice } = useCurrency();
    const [purchasedItems, setPurchasedItems] = useState([]);
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

                // Flatten orders into items
                const allItems = data.flatMap(pedido =>
                    pedido.items.map(item => ({
                        ...item,
                        orderId: pedido._id,
                        orderDate: pedido.createdAt,
                        isPaid: pedido.isPaid
                    }))
                ).filter(item => item.isPaid); // Only show paid items

                // Deduplicate items by productId (keep the most recent one)
                const uniqueItemsMap = new Map();

                allItems.forEach(item => {
                    const prodId = typeof item.productId === 'object' ? item.productId?._id : item.productId;

                    if (prodId) {
                        // If item not in map or current item is newer, update map
                        if (!uniqueItemsMap.has(prodId) || new Date(item.orderDate) > new Date(uniqueItemsMap.get(prodId).orderDate)) {
                            uniqueItemsMap.set(prodId, item);
                        }
                    }
                });

                setPurchasedItems(Array.from(uniqueItemsMap.values()));
            } catch (err) {
                console.error('Erro ao buscar pedidos:', err);
                setError('Não foi possível carregar sua biblioteca.');
            } finally {
                setLoading(false);
            }
        };

        fetchPedidos();
    }, []);

    const filteredItems = purchasedItems.filter(item =>
        item.productName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDownload = async (item) => {
        try {
            toast.info('Preparando seu download...', { autoClose: 2000 });
            const token = localStorage.getItem('userToken');
            const idDoProduto = typeof item.productId === 'object' ? item.productId?._id : item.productId;

            if (!idDoProduto) {
                toast.error('Produto não encontrado.');
                return;
            }

            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/download/secure`,
                { productId: idDoProduto },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data?.downloadUrl) {
                const link = document.createElement('a');
                link.href = response.data.downloadUrl;
                link.setAttribute('download', item.productName || 'download');
                document.body.appendChild(link);
                link.click();
                link.remove();
                toast.success('Download iniciado com sucesso!');
            } else {
                throw new Error('URL de download não recebida.');
            }

        } catch (err) {
            console.error('Erro ao baixar:', err);
            toast.error('Erro ao iniciar download. Tente novamente.');
        }
    };

    if (loading) return (
        <div className="library-loading">
            <div className="spinner"></div>
            <p>Carregando sua biblioteca...</p>
        </div>
    );

    if (error) return (
        <div className="library-error">
            <p>{error}</p>
            <button className="btn-retry" onClick={() => window.location.reload()}>Tentar Novamente</button>
        </div>
    );

    return (
        <div className="library-tab-enhanced">
            <div className="library-header">
                <div className="header-info">
                    <h2>{t('profile.biblioteca')}</h2>
                    <p>Acesse e baixe todas as suas artes digitais adquiridas.</p>
                </div>

                <div className="library-help-tip">
                    <FaQuestionCircle />
                    <span>Seus arquivos ficam disponíveis vitaliciamente aqui.</span>
                </div>
            </div>

            <div className="library-controls">
                <div className="search-bar-wrapper">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Buscar em meus arquivos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {filteredItems.length === 0 ? (
                <div className="empty-library">
                    <div className="empty-icon-wrapper">
                        <FaCloudDownloadAlt />
                    </div>
                    {searchTerm ? (
                        <p>Nenhum item encontrado para "{searchTerm}".</p>
                    ) : (
                        <>
                            <h3>Sua biblioteca está vazia</h3>
                            <p>Suas compras aprovadas aparecerão aqui para download.</p>
                            <a href="/" className="btn-explore">Explorar Loja</a>
                        </>
                    )}
                </div>
            ) : (
                <div className="downloads-grid">
                    {filteredItems.map((item, index) => {
                        const productImg = item.productId?.imageUrls?.[0]
                            || item.productId?.imageUrl
                            || null;

                        return (
                            <div key={`${item.orderId}-${index}`} className="download-card">
                                <div className="card-image-area">
                                    {productImg ? (
                                        <img src={productImg} alt={item.productName} loading="lazy" />
                                    ) : (
                                        <div className="placeholder-image">
                                            <FaFileImage />
                                        </div>
                                    )}
                                    <div className="overlay-actions">
                                        <button
                                            onClick={() => handleDownload(item)}
                                            className="btn-download-overlay"
                                            title="Baixar Agora"
                                        >
                                            <FaDownload />
                                        </button>
                                    </div>
                                </div>
                                <div className="card-content-area">
                                    <h4 title={item.productName}>{item.productName}</h4>
                                    <div className="meta-info">
                                        <span className="purchase-date">
                                            Adquirido em {new Date(item.orderDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => handleDownload(item)}
                                        className="btn-download-full"
                                    >
                                        <FaCloudDownloadAlt /> Baixar Arquivo
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
