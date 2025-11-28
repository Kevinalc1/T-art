import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext.jsx';
import './AdminDashboard.css'; // Reusing admin styles

const API_URL = import.meta.env.VITE_API_URL;

export default function SalesDashboard() {
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { token } = useAuth();

    useEffect(() => {
        const fetchPedidos = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/pedidos/todos`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPedidos(response.data);
            } catch (err) {
                console.error("Erro ao buscar vendas:", err);
                setError("Não foi possível carregar os dados de vendas.");
            } finally {
                setLoading(false);
            }
        };

        fetchPedidos();
    }, [token]);

    // Cálculos
    const totalVendas = pedidos.reduce((acc, pedido) => acc + pedido.totalPrice, 0);
    const totalPedidos = pedidos.length;

    const formatarMoeda = (valor) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
    const formatarData = (data) => new Date(data).toLocaleDateString('pt-BR');

    if (loading) return <p>Carregando dashboard...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="admin-content">
            <h1>Dashboard de Vendas</h1>

            <div className="dashboard-stats">
                <div className="stat-card">
                    <h3>Total de Vendas</h3>
                    <p className="stat-value">{formatarMoeda(totalVendas)}</p>
                </div>
                <div className="stat-card">
                    <h3>Total de Pedidos</h3>
                    <p className="stat-value">{totalPedidos}</p>
                </div>
            </div>

            <h2>Últimas Vendas</h2>
            {pedidos.length === 0 ? (
                <p>Nenhuma venda registrada.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Cliente</th>
                            <th>Total</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pedidos.map((pedido) => (
                            <tr key={pedido._id}>
                                <td>{formatarData(pedido.createdAt)}</td>
                                <td>{pedido.userEmail}</td>
                                <td>{formatarMoeda(pedido.totalPrice)}</td>
                                <td>{pedido.isPaid ? 'Pago' : 'Pendente'}</td>
                                {/* Ajuste conforme seu modelo de dados real */}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
