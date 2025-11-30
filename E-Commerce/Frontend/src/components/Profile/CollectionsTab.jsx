import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaFolder, FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
import './ProfileTabs.css';

export default function CollectionsTab() {
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newCollectionName, setNewCollectionName] = useState('');

    const fetchCollections = async () => {
        try {
            const token = localStorage.getItem('userToken');
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/collections`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCollections(data);
        } catch (err) {
            console.error('Erro ao buscar coleções:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCollections();
    }, []);

    const handleCreateCollection = async () => {
        if (!newCollectionName.trim()) return;
        try {
            const token = localStorage.getItem('userToken');
            await axios.post(`${import.meta.env.VITE_API_URL}/api/users/collections`,
                { name: newCollectionName },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setNewCollectionName('');
            setIsCreating(false);
            fetchCollections();
        } catch (err) {
            alert('Erro ao criar coleção');
        }
    };

    const handleDeleteCollection = async (id) => {
        if (!window.confirm('Tem certeza que deseja excluir esta coleção?')) return;
        try {
            const token = localStorage.getItem('userToken');
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/users/collections/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchCollections();
        } catch (err) {
            alert('Erro ao excluir coleção');
        }
    };

    if (loading) return <div>Carregando coleções...</div>;

    return (
        <div className="collections-tab">
            <div className="tab-header">
                <h2>Meus Favoritos e Projetos</h2>
                <button className="btn-create" onClick={() => setIsCreating(true)}>
                    <FaPlus /> Nova Coleção
                </button>
            </div>

            {isCreating && (
                <div className="create-collection-form">
                    <input
                        type="text"
                        placeholder="Nome da coleção (ex: Verão 2025)"
                        value={newCollectionName}
                        onChange={(e) => setNewCollectionName(e.target.value)}
                    />
                    <button onClick={handleCreateCollection}>Salvar</button>
                    <button onClick={() => setIsCreating(false)} className="cancel">Cancelar</button>
                </div>
            )}

            <div className="collections-grid">
                {collections.map(col => (
                    <div key={col._id} className="collection-card">
                        <div className="collection-icon">
                            <FaFolder />
                        </div>
                        <div className="collection-info">
                            <h3>{col.name}</h3>
                            <p>{col.products.length} itens</p>
                        </div>
                        <div className="collection-actions">
                            <button onClick={() => handleDeleteCollection(col._id)} className="btn-icon delete">
                                <FaTrash />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
