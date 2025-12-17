import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminDashboard.css'; // Reusing existing styles or create new ones

export default function AdminOrdersDashboard() {
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

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
                    order.items.forEach(item => {
                        allPurchases.push({
                            _id: item._id || `${order._id}-${item.productId?._id}`, // Fallback key
                            orderId: order._id,
                            clientLogin: order.userEmail,
                            fileName: item.productName,
                            image: item.productId?.imageUrls?.[0] || 'https://via.placeholder.com/60',
                            date: order.createdAt
                        });
                    });
                });

                // Sort by date descending
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
            dateStr.includes(term)
        );
    });

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredPurchases.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredPurchases.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Reset pagination on search
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    return (
        <div className="admin-dashboard">
            <main className="admin-content">
                <div className="admin-header">
                    <h1>Dashboard de Vendas</h1>
                </div>

                {/* Search Input */}
                <div className="admin-controls" style={{ marginBottom: '20px' }}>
                    <input
                        type="text"
                        placeholder="Buscar por cliente, arquivo ou data..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            padding: '10px',
                            width: '100%',
                            maxWidth: '400px',
                            borderRadius: '5px',
                            border: '1px solid #ddd',
                            fontSize: '1rem'
                        }}
                    />
                </div>

                {loading ? (
                    <p>Carregando vendas...</p>
                ) : (
                    <>
                        <table>
                            <thead>
                                <tr>
                                    <th>Imagem</th>
                                    <th>Cliente (Login)</th>
                                    <th>Arquivo</th>
                                    <th>Data</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.map((purchase, index) => (
                                    <tr key={`${purchase.orderId}-${index}`}>
                                        <td>
                                            <img
                                                src={purchase.image}
                                                alt={purchase.fileName}
                                                className="admin-product-image"
                                                style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                                            />
                                        </td>
                                        <td>{purchase.clientLogin}</td>
                                        <td>{purchase.fileName}</td>
                                        <td>{new Date(purchase.date).toLocaleDateString('pt-BR')}</td>
                                    </tr>
                                ))}
                                {currentItems.length === 0 && (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>Nenhuma venda encontrada.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="pagination" style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '5px' }}>
                                <button
                                    onClick={() => paginate(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="page-btn"
                                    style={{ padding: '5px 10px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                                >
                                    Anterior
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => paginate(i + 1)}
                                        className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                                        style={{
                                            padding: '5px 10px',
                                            cursor: 'pointer',
                                            backgroundColor: currentPage === i + 1 ? '#133853' : '#fff',
                                            color: currentPage === i + 1 ? '#fff' : '#333',
                                            border: '1px solid #ddd',
                                            borderRadius: '3px'
                                        }}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button
                                    onClick={() => paginate(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="page-btn"
                                    style={{ padding: '5px 10px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                                >
                                    Próximo
                                </button>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
