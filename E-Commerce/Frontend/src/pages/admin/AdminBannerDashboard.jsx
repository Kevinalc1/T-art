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

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            const response = await fetch(`${API_URL}/api/banners/admin`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Erro ao carregar banners');
            const data = await response.json();
            setBanners(data);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

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
        } catch (error) {
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
        } catch (error) {
            toast.error('Erro ao atualizar status');
        }
    };

    if (loading) return <div className="admin-content"><p>Carregando...</p></div>;

    return (
        <div className="admin-content">
            <div className="admin-header">
                <h1>Gerenciar Banners</h1>
                <Link to="/admin/banners/novo" className="btn-add">
                    <FaPlus /> Novo Banner
                </Link>
            </div>

            <div className="table-responsive">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Imagem</th>
                            <th>Título</th>
                            <th>Posição</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {banners.map(banner => (
                            <tr key={banner._id}>
                                <td>
                                    <img
                                        src={banner.imageUrl}
                                        alt={banner.title}
                                        style={{ width: '100px', height: 'auto', objectFit: 'cover' }}
                                    />
                                </td>
                                <td>{banner.title}</td>
                                <td>{banner.position}</td>
                                <td>
                                    <button
                                        onClick={() => toggleActive(banner)}
                                        className="btn-icon"
                                        title={banner.active ? "Desativar" : "Ativar"}
                                    >
                                        {banner.active ? <FaToggleOn color="green" size={20} /> : <FaToggleOff color="gray" size={20} />}
                                    </button>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <Link to={`/admin/banners/editar/${banner._id}`} className="btn-icon edit">
                                            <FaEdit />
                                        </Link>
                                        <button onClick={() => handleDelete(banner._id)} className="btn-icon delete">
                                            <FaTrash />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {banners.length === 0 && (
                            <tr>
                                <td colSpan="5" className="text-center">Nenhum banner encontrado.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
