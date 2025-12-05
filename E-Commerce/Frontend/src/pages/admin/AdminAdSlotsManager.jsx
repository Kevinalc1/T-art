import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import './AdminAdSlotsManager.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const AdminAdSlotsManager = () => {
    const { token } = useAuth();
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);

    // Buscar todos os ad slots
    const fetchSlots = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/api/ad-slots`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSlots(response.data);
        } catch (error) {
            console.error('Erro ao buscar ad slots:', error);
            toast.error('Erro ao carregar espaços publicitários');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!token) {
            toast.error('Token de autenticação não encontrado');
            return;
        }
        fetchSlots();
    }, [token]);

    // Popular slots iniciais
    const handleSeedSlots = async () => {
        try {
            await axios.post(
                `${API_URL}/api/ad-slots/seed`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Espaços publicitários criados com sucesso!');
            fetchSlots();
        } catch (error) {
            console.error('Erro ao popular slots:', error);
            toast.error(error.response?.data?.error || 'Erro ao criar espaços');
        }
    };

    // Alternar status do slot
    const toggleSlotStatus = async (slotId, currentStatus) => {
        try {
            await axios.put(
                `${API_URL}/api/ad-slots/${slotId}`,
                { isActive: !currentStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success(`Espaço ${!currentStatus ? 'ativado' : 'desativado'} com sucesso!`);
            fetchSlots();
        } catch (error) {
            console.error('Erro ao atualizar slot:', error);
            toast.error('Erro ao atualizar espaço publicitário');
        }
    };

    // Obter ícone por posição
    const getPositionIcon = (position) => {
        const icons = {
            header: '📌',
            sidebar: '📊',
            'in-content': '📄',
            footer: '⬇️',
        };
        return icons[position] || '📍';
    };

    // Obter label por posição
    const getPositionLabel = (position) => {
        const labels = {
            header: 'Cabeçalho',
            sidebar: 'Barra Lateral',
            'in-content': 'Dentro do Conteúdo',
            footer: 'Rodapé',
        };
        return labels[position] || position;
    };

    return (
        <div className="ad-slots-manager">
            <div className="manager-header">
                <h1>Gerenciamento de Espaços Publicitários</h1>
                {slots.length === 0 && !loading && (
                    <button onClick={handleSeedSlots} className="btn-seed">
                        Criar Espaços Iniciais
                    </button>
                )}
            </div>

            <p className="manager-description">
                Ative ou desative áreas publicitárias predefinidas no layout do site sem mexer no código-fonte.
            </p>

            {loading ? (
                <p className="loading-text">Carregando...</p>
            ) : slots.length === 0 ? (
                <div className="empty-state">
                    <p>Nenhum espaço publicitário encontrado.</p>
                    <p>Clique em "Criar Espaços Iniciais" para começar.</p>
                </div>
            ) : (
                <div className="slots-grid">
                    {slots.map((slot) => (
                        <div key={slot._id} className={`slot-card ${slot.isActive ? 'active' : 'inactive'}`}>
                            <div className="slot-header">
                                <div className="slot-title">
                                    <span className="slot-icon">{getPositionIcon(slot.position)}</span>
                                    <h3>{slot.name}</h3>
                                </div>
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={slot.isActive}
                                        onChange={() => toggleSlotStatus(slot._id, slot.isActive)}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>

                            <div className="slot-details">
                                <p className="slot-position">
                                    <strong>Posição:</strong> {getPositionLabel(slot.position)}
                                </p>
                                <p className="slot-description">{slot.description}</p>
                                <div className="slot-dimensions">
                                    <span className="dimension-badge">
                                        {slot.dimensions.width} × {slot.dimensions.height}
                                    </span>
                                    <span className={`status-badge ${slot.isActive ? 'status-active' : 'status-inactive'}`}>
                                        {slot.isActive ? 'Ativo' : 'Inativo'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminAdSlotsManager;
