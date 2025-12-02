import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import './AdminBannerForm.css';

const API_URL = import.meta.env.VITE_API_URL;

export default function AdminBannerForm() {
    const [formData, setFormData] = useState({
        title: '',
        imageUrl: '',
        linkUrl: '',
        position: 'hero',
        active: true,
        startDate: '',
        endDate: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();

    useEffect(() => {
        if (id) {
            fetchBanner();
        }
    }, [id]);

    const fetchBanner = async () => {
        try {
            const response = await fetch(`${API_URL}/api/banners/admin`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            const banner = data.find(b => b._id === id);
            if (banner) {
                setFormData({
                    title: banner.title,
                    imageUrl: banner.imageUrl,
                    linkUrl: banner.linkUrl || '',
                    position: banner.position,
                    active: banner.active,
                    startDate: banner.startDate ? banner.startDate.split('T')[0] : '',
                    endDate: banner.endDate ? banner.endDate.split('T')[0] : ''
                });
            }
        } catch (error) {
            toast.error('Erro ao carregar banner');
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            // Preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, imageUrl: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const uploadImage = async () => {
        if (!imageFile) return formData.imageUrl;

        const formDataUpload = new FormData();
        formDataUpload.append('image', imageFile);

        try {
            const response = await fetch(`${API_URL}/api/upload`, {
                method: 'POST',
                body: formDataUpload,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            return data.imageUrl; // Adjust based on your upload response structure
        } catch (error) {
            console.error('Upload error:', error);
            throw new Error('Falha no upload da imagem');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let finalImageUrl = formData.imageUrl;
            if (imageFile) {
                // If using local upload strategy, we might need to adjust this.
                // Assuming standard upload endpoint returns the URL.
                // If using Cloudinary directly on frontend, logic would be different.
                // Based on previous tasks, we have a local upload endpoint.

                // However, for banners, we might want to use the same upload route as products?
                // Let's assume /api/upload handles it.

                // NOTE: The uploadRoutes.js usually handles 'image' field.

                const uploadData = new FormData();
                uploadData.append('image', imageFile);

                const uploadRes = await fetch(`${API_URL}/api/upload`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: uploadData
                });

                if (!uploadRes.ok) throw new Error('Erro ao fazer upload da imagem');

                const uploadResult = await uploadRes.json();
                // The upload route usually returns the path. 
                // Let's check how it returns. Usually { image: '/uploads/...' } or similar.
                // Assuming it returns the full URL or relative path.
                // Based on previous context, it might return just the path.

                // Let's assume standard behavior for now.
                finalImageUrl = uploadResult.image || uploadResult.url || uploadResult;
            }

            const payload = {
                ...formData,
                imageUrl: finalImageUrl
            };

            const url = id ? `${API_URL}/api/banners/${id}` : `${API_URL}/api/banners`;
            const method = id ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('Erro ao salvar banner');

            toast.success('Banner salvo com sucesso!');
            navigate('/perfil/banners'); // Redirect to dashboard
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-content">
            <h1>{id ? 'Editar Banner' : 'Novo Banner'}</h1>
            <form onSubmit={handleSubmit} className="admin-form">
                <div className="form-group">
                    <label>Título</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Imagem</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        required={!id} // Required only on creation
                    />
                    {formData.imageUrl && (
                        <div className="image-preview">
                            <img src={formData.imageUrl} alt="Preview" style={{ maxWidth: '100%', marginTop: '10px' }} />
                        </div>
                    )}
                </div>

                <div className="form-group">
                    <label>Link de Destino (Opcional)</label>
                    <input
                        type="text"
                        name="linkUrl"
                        value={formData.linkUrl}
                        onChange={handleChange}
                        placeholder="/colecoes/nova-colecao"
                    />
                </div>

                <div className="form-group">
                    <label>Posição</label>
                    <select name="position" value={formData.position} onChange={handleChange}>
                        <option value="hero">Hero (Carrossel Principal)</option>
                        <option value="sidebar">Sidebar</option>
                        <option value="footer">Footer</option>
                    </select>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Data Início</label>
                        <input
                            type="date"
                            name="startDate"
                            value={formData.startDate}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Data Fim</label>
                        <input
                            type="date"
                            name="endDate"
                            value={formData.endDate}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="form-group checkbox-group">
                    <label>
                        <input
                            type="checkbox"
                            name="active"
                            checked={formData.active}
                            onChange={handleChange}
                        />
                        Ativo
                    </label>
                </div>

                <div className="form-actions">
                    <button type="button" onClick={() => navigate('/perfil/banners')} className="btn-cancel">
                        Cancelar
                    </button>
                    <button type="submit" className="btn-save" disabled={loading}>
                        {loading ? 'Salvando...' : 'Salvar Banner'}
                    </button>
                </div>
            </form>
        </div>
    );
}
