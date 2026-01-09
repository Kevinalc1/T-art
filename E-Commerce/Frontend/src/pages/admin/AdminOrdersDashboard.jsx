import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSearch, FaFileImage, FaCreditCard, FaMoneyBillWave, FaCalendarAlt, FaUser } from 'react-icons/fa';
import './AdminDashboard.css';

export default function AdminOrdersDashboard() {
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8; // Reduce items per page for card layout

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const token = localStorage.getItem('userToken');
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/pedidos/todos`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // Flatten orders into individual item purchases
                const allPurchases = [];
                response.data.forEach(order => {
                    const paymentMethod = order.paymentMethod || 'card'; // Default to card if missing

                    order.items.forEach(item => {
                        allPurchases.push({
                            _id: item._id || `${order._id}-${item.productId?._id}`,
                            orderId: order._id, // Keep order ID for reference
                            orderShortId: order._id.slice(-6).toUpperCase(),
                            clientLogin: order.userEmail,
                            fileName: item.productName,
                            image: item.productId?.imageUrls?.[0] || null,
                            price: item.price,
                            date: order.createdAt,
                            paymentMethod: paymentMethod,
                            status: order.isPaid ? 'Pago' : 'Pendente'
                        });
                    });
                });

                // Sort by date descending (newest first)
                allPurchases.sort((a, b) => new Date(b.date) - new Date(a.date));

                setPurchases(allPurchases);
            } catch (error) {
                console.error("Erro ao buscar pedidos:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    // Filter Logic
    const filteredPurchases = purchases.filter(purchase => {
        const term = searchTerm.toLowerCase();
        const dateStr = new Date(purchase.date).toLocaleDateString('pt-BR');

        return (
            purchase.clientLogin.toLowerCase().includes(term) ||
            purchase.fileName.toLowerCase().includes(term) ||
            purchase.orderShortId.toLowerCase().includes(term) ||
            dateStr.includes(term)
        );
    });

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredPurchases.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredPurchases.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const getPaymentIcon = (method) => {
        if (method === 'pix') return <FaMoneyBillWave className="icon-pix" />;
        return <FaCreditCard className="icon-card" />;
    };

    const formatPaymentMethod = (method) => {
        if (method === 'pix') return 'Pix';
        if (method === 'card') return 'Cartão';
        return method;
    };

    return (
        <div className="admin-dashboard-enhanced">
            <header className="admin-header-enhanced">
                <div className="header-title">
                    <h1>Vendas Recentes</h1>
                    <p>Monitore todas as transações da loja em tempo real.</p>
                </div>
                <div className="admin-search-enhanced">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Buscar por cliente, produto ou ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </header>

            {loading ? (
                <div className="admin-loading">
                    <div className="spinner"></div>
                    <p>Carregando dados...</p>
                </div>
            ) : (
                <div className="sales-grid-container">
                    {currentItems.length === 0 ? (
                        <div className="admin-empty-state">
                            <p>Nenhuma venda encontrada para os filtros aplicados.</p>
                        </div>
                    ) : (
                        <div className="sales-cards-grid">
                            {currentItems.map((purchase, index) => (
                                <div key={`${purchase.orderId}-${index}`} className="sale-card">
                                    <div className="sale-card-header">
                                        <span className="order-id">#{purchase.orderShortId}</span>
                                        <span className={`status-badge ${purchase.status === 'Pago' ? 'paid' : 'pending'}`}>
                                            {purchase.status}
                                        </span>
                                    </div>

                                    <div className="sale-product-info">
                                        <div className="product-thumb">
                                            {purchase.image ? (
                                                <img src={purchase.image} alt={purchase.fileName} />
                                            ) : (
                                                <div className="placeholder-thumb"><FaFileImage /></div>
                                            )}
                                        </div>
                                        <div className="product-details">
                                            <h3 title={purchase.fileName}>{purchase.fileName}</h3>
                                            <span className="product-price">R$ {purchase.price.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <div className="sale-meta-info">
                                        <div className="meta-row">
                                            <FaUser className="meta-icon" />
                                            <span className="client-email" title={purchase.clientLogin}>
                                                {purchase.clientLogin}
                                            </span>
                                        </div>
                                        <div className="meta-row">
                                            <FaCalendarAlt className="meta-icon" />
                                            <span>{new Date(purchase.date).toLocaleDateString('pt-BR')}</span>
                                        </div>
                                        <div className="meta-row payment-row">
                                            {getPaymentIcon(purchase.paymentMethod)}
                                            <span className="payment-label">
                                                Via {formatPaymentMethod(purchase.paymentMethod)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="admin-pagination">
                            <button
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="pagination-btn"
                            >
                                Anterior
                            </button>
                            <span className="page-info">
                                Página {currentPage} de {totalPages}
                            </span>
                            <button
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="pagination-btn"
                            >
                                Próximo
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
