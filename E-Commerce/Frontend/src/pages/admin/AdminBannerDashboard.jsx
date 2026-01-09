import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaPlus, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import './AdminDashboard.css'; // Reusing existing admin styles

const API_URL = import.meta.env.VITE_API_URL;

export default function AdminBannerDashboard() {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token } = useAuth();

    const fetchBanners = React.useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/api/banners/admin`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Erro ao carregar banners');
            const data = await response.json();
            setBanners(data);
        } catch {
            toast.error('Erro ao carregar banners');
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchBanners();
    }, [fetchBanners]);

    const handleDelete = async (id) => {
        if (!window.confirm('Tem certeza que deseja excluir este banner?')) return;

        try {
            const response = await fetch(`${API_URL}/api/banners/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                toast.success('Banner excluído com sucesso');
                setBanners(banners.filter(banner => banner._id !== id));
            } else {
                toast.error('Erro ao excluir banner');
            }
        } catch {
            toast.error('Erro de conexão');
        }
    };

    const toggleActive = async (banner) => {
        try {
            const response = await fetch(`${API_URL}/api/banners/${banner._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ active: !banner.active })
            });

            if (response.ok) {
                const updatedBanner = await response.json();
                setBanners(banners.map(b => b._id === updatedBanner._id ? updatedBanner : b));
                toast.success(`Banner ${updatedBanner.active ? 'ativado' : 'desativado'}`);
            }
        } catch {
            toast.error('Erro ao atualizar status');
        }
    };

    if (loading) return <div className="admin-content"><p>Carregando...</p></div>;

    return (
        <div className="admin-dashboard-enhanced">
            <header className="admin-header-enhanced">
                <div className="header-title">
                    <h1>Gerenciar Banners</h1>
                    <p>Controle os banners promocionais da loja.</p>
                </div>
                <Link to="/admin/banners/novo" className="btn-novo" style={{ height: '42px', display: 'flex', alignItems: 'center' }}>
                    <FaPlus style={{ marginRight: '8px' }} /> Novo Banner
                </Link>
            </header>

            <div className="admin-content-wrapper">
                <main className="admin-main-grid-area">
                    {banners.length === 0 ? (
                        <div className="admin-empty-state">
                            <p>Nenhum banner encontrado.</p>
                        </div>
                    ) : (
                        <div className="admin-product-grid">
                            {banners.map(banner => (
                                <div key={banner._id} className="product-card">
                                    <div className="product-card-image" style={{ height: '140px' }}>
                                        <img
                                            src={banner.imageUrl}
                                            alt={banner.title}
                                            style={{ objectFit: 'contain', background: '#f8f9fa' }} // Banners often have different aspect ratios
                                        />
                                    </div>
                                    <div className="product-card-content">
                                        <h3 className="product-card-title">{banner.title}</h3>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                            <span style={{ fontSize: '0.85rem', color: '#6b7280', background: '#f3f4f6', padding: '2px 8px', borderRadius: '4px' }}>
                                                {banner.position}
                                            </span>

                                            <button
                                                onClick={() => toggleActive(banner)}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                                                title={banner.active ? "Desativar" : "Ativar"}
                                            >
                                                {banner.active ?
                                                    <><FaToggleOn color="#10b981" size={24} /> <span style={{ fontSize: '0.8rem', color: '#10b981' }}>Ativo</span></> :
                                                    <><FaToggleOff color="#9ca3af" size={24} /> <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Inativo</span></>
                                                }
                                            </button>
                                        </div>

                                        <div className="product-card-actions">
                                            <Link to={`/admin/banners/editar/${banner._id}`} className="btn-card-edit">
                                                <FaEdit /> Editar
                                            </Link>
                                            <button onClick={() => handleDelete(banner._id)} className="btn-card-delete">
                                                <FaTrash /> Apagar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
