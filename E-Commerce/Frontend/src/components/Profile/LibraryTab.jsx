import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaDownload, FaFileImage, FaFileArchive, FaFileAlt } from 'react-icons/fa';
import './ProfileTabs.css'; // Vamos criar um CSS compartilhado

export default function LibraryTab() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchLibrary = async () => {
            try {
                const token = localStorage.getItem('userToken');
                const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/library`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setProducts(data);
            } catch (err) {
                console.error('Erro ao buscar biblioteca:', err);
                setError('Não foi possível carregar sua biblioteca.');
            } finally {
                setLoading(false);
            }
        };

        fetchLibrary();
    }, []);

    const filteredProducts = products.filter(product =>
        product.productName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDownload = async (product, type) => {
        // Registra o download
        try {
            const token = localStorage.getItem('userToken');
            await axios.post(`${import.meta.env.VITE_API_URL}/api/users/downloads`,
                { productId: product._id, version: product.version },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (err) {
            console.error('Erro ao registrar download:', err);
        }

        // Inicia o download real
        let url = product.downloadUrl;
        if (type === 'image' && product.imageUrls.length > 0) url = product.imageUrls[0];
        // Se tivermos URLs específicas para AI/PSD no futuro, usaríamos aqui.

        if (url) {
            window.open(url, '_blank');
        } else {
            alert('Link de download não disponível.');
        }
    };

    if (loading) return <div className="loading-spinner">Carregando biblioteca...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="library-tab">
            <h2>Minha Biblioteca de Estampas</h2>

            <div className="library-search">
                <input
                    type="text"
                    placeholder="Buscar em meus downloads..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

            {filteredProducts.length === 0 ? (
                <p className="empty-state">
                    {searchTerm ? 'Nenhum produto encontrado para sua busca.' : 'Você ainda não possui estampas. Explore a loja!'}
                </p>
            ) : (
                <div className="library-grid">
                    {filteredProducts.map(product => (
                        <div key={product._id} className="library-card">
                            <div className="card-thumb">
                                <img src={product.imageUrls[0]} alt={product.productName} />
                                <span className="version-badge">v{product.version || '1.0'}</span>
                            </div>
                            <div className="card-content">
                                <h3>{product.productName}</h3>
                                <div className="tech-specs">
                                    {product.technicalSpecs?.dpi && <span title="DPI"><FaFileImage /> {product.technicalSpecs.dpi} DPI</span>}
                                    {product.technicalSpecs?.format && <span title="Formato"><FaFileAlt /> {product.technicalSpecs.format}</span>}
                                    {product.technicalSpecs?.isVector && <span title="Vetorial"><FaFileArchive /> Vetor</span>}
                                </div>
                                <div className="download-actions">
                                    <button onClick={() => handleDownload(product, 'zip')} className="btn-download primary">
                                        <FaDownload /> Pacote Completo (.ZIP)
                                    </button>
                                    <div className="secondary-downloads">
                                        <button onClick={() => handleDownload(product, 'image')} className="btn-download sm">
                                            <FaFileImage /> .PNG
                                        </button>
                                        {/* Botão placeholder para futuro suporte a editáveis separados */}
                                        <button onClick={() => handleDownload(product, 'zip')} className="btn-download sm" title="Incluído no ZIP">
                                            .AI / .PSD
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
