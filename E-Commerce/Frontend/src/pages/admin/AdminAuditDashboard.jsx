import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import './AdminAuditDashboard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const AdminAuditDashboard = () => {
    const { token } = useAuth();
    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        type: '',
        userEmail: '',
        startDate: '',
        endDate: '',
    });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        pages: 0,
    });

    // Buscar logs
    const fetchLogs = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: pagination.page,
                limit: pagination.limit,
                ...filters,
            });

            const response = await axios.get(`${API_URL}/api/transaction-logs?${params}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setLogs(response.data.logs);
            setPagination(response.data.pagination);
        } catch (error) {
            console.error('Erro ao buscar logs:', error);
            toast.error('Erro ao carregar logs de transações');
        } finally {
            setLoading(false);
        }
    };

    // Buscar estatísticas
    const fetchStats = async () => {
        try {
            const params = new URLSearchParams({
                startDate: filters.startDate,
                endDate: filters.endDate,
            });

            const response = await axios.get(`${API_URL}/api/transaction-logs/stats?${params}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setStats(response.data);
        } catch (error) {
            console.error('Erro ao buscar estatísticas:', error);
        }
    };

    useEffect(() => {
        if (!token) {
            toast.error('Token de autenticação não encontrado. Faça login novamente.');
            return;
        }
        fetchLogs();
        fetchStats();
    }, [pagination.page, filters]);

    // Exportar para CSV
    const handleExport = async () => {
        try {
            const params = new URLSearchParams(filters);

            const response = await axios.get(`${API_URL}/api/transaction-logs/export?${params}`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob', // Importante para download de arquivo
            });

            // Criar link de download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `transaction-logs-${Date.now()}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            toast.success('Exportação concluída!');
        } catch (error) {
            console.error('Erro ao exportar:', error);
            toast.error('Erro ao exportar logs');
        }
    };

    // Formatar valor em BRL
    const formatCurrency = (value, currency = 'BRL') => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: currency,
        }).format(value);
    };

    // Formatar data
    const formatDate = (date) => {
        return new Date(date).toLocaleString('pt-BR');
    };

    // Obter classe CSS por tipo
    const getTypeClass = (type) => {
        const classes = {
            PAYMENT: 'type-payment',
            REFUND: 'type-refund',
            COMMISSION: 'type-commission',
            CREDIT: 'type-credit',
        };
        return classes[type] || '';
    };

    // Obter label por tipo
    const getTypeLabel = (type) => {
        const labels = {
            PAYMENT: 'Pagamento',
            REFUND: 'Estorno',
            COMMISSION: 'Comissão',
            CREDIT: 'Crédito',
        };
        return labels[type] || type;
    };

    return (
        <div className="audit-dashboard">
            <div className="audit-header">
                <h1>Auditoria Financeira</h1>
                <button onClick={handleExport} className="btn-export">
                    Exportar CSV
                </button>
            </div>

            {/* Estatísticas */}
            {stats && (
                <div className="stats-grid">
                    <div className="stat-card income">
                        <h3>Total de Entradas</h3>
                        <p className="stat-value">{formatCurrency(stats.summary.totalIncome)}</p>
                    </div>
                    <div className="stat-card outcome">
                        <h3>Total de Saídas</h3>
                        <p className="stat-value">{formatCurrency(stats.summary.totalOutcome)}</p>
                    </div>
                    <div className="stat-card balance">
                        <h3>Saldo Líquido</h3>
                        <p className="stat-value">{formatCurrency(stats.summary.netBalance)}</p>
                    </div>
                </div>
            )}

            {/* Filtros */}
            <div className="filters-section">
                <div className="filter-group">
                    <label>Tipo:</label>
                    <select
                        value={filters.type}
                        onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                    >
                        <option value="">Todos</option>
                        <option value="PAYMENT">Pagamento</option>
                        <option value="REFUND">Estorno</option>
                        <option value="COMMISSION">Comissão</option>
                        <option value="CREDIT">Crédito</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>Email:</label>
                    <input
                        type="text"
                        value={filters.userEmail}
                        onChange={(e) => setFilters({ ...filters, userEmail: e.target.value })}
                        placeholder="Buscar por email..."
                    />
                </div>

                <div className="filter-group">
                    <label>Data Inicial:</label>
                    <input
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                    />
                </div>

                <div className="filter-group">
                    <label>Data Final:</label>
                    <input
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                    />
                </div>

                <button
                    onClick={() => setFilters({ type: '', userEmail: '', startDate: '', endDate: '' })}
                    className="btn-clear-filters"
                >
                    Limpar Filtros
                </button>
            </div>

            {/* Tabela de Logs */}
            {loading ? (
                <p className="loading-text">Carregando...</p>
            ) : (
                <>
                    <div className="logs-table-container">
                        <table className="logs-table">
                            <thead>
                                <tr>
                                    <th>Data</th>
                                    <th>Tipo</th>
                                    <th>Valor</th>
                                    <th>Email</th>
                                    <th>Método</th>
                                    <th>Status</th>
                                    <th>Descrição</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="no-data">
                                            Nenhuma transação encontrada
                                        </td>
                                    </tr>
                                ) : (
                                    logs.map((log) => (
                                        <tr key={log._id}>
                                            <td>{formatDate(log.createdAt)}</td>
                                            <td>
                                                <span className={`type-badge ${getTypeClass(log.type)}`}>
                                                    {getTypeLabel(log.type)}
                                                </span>
                                            </td>
                                            <td className="amount">{formatCurrency(log.amount, log.currency)}</td>
                                            <td>{log.userEmail}</td>
                                            <td>{log.paymentMethod || 'N/A'}</td>
                                            <td>
                                                <span className={`status-badge status-${log.status}`}>
                                                    {log.status}
                                                </span>
                                            </td>
                                            <td className="description">{log.description || 'N/A'}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginação */}
                    {pagination.pages > 1 && (
                        <div className="pagination">
                            <button
                                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                                disabled={pagination.page === 1}
                            >
                                Anterior
                            </button>
                            <span>
                                Página {pagination.page} de {pagination.pages}
                            </span>
                            <button
                                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                                disabled={pagination.page === pagination.pages}
                            >
                                Próxima
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default AdminAuditDashboard;
