import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import SalesDashboard from './admin/SalesDashboard.jsx';
import MeusPedidos from './MeusPedidos.jsx';

export default function ProfileHome() {
    const { user } = useAuth();

    if (user && user.isAdmin) {
        return <SalesDashboard />;
    }

    return <MeusPedidos />;
}
