import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import './ConfiguracoesPage.css';

const API_URL = import.meta.env.VITE_API_URL;

export default function ConfiguracoesPage() {
    const { user, token, logout } = useAuth();
    const [emailData, setEmailData] = useState({
        newEmail: '',
        password: '',
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [loadingEmail, setLoadingEmail] = useState(false);
    const [loadingPassword, setLoadingPassword] = useState(false);

    // Alterar Email
    const handleEmailChange = async (e) => {
        e.preventDefault();

        if (!emailData.newEmail || !emailData.password) {
            toast.error('Preencha todos os campos');
            return;
        }

        setLoadingEmail(true);
        try {
            const response = await axios.put(
                `${API_URL}/api/users/update-email`,
                {
                    newEmail: emailData.newEmail,
                    password: emailData.password,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            toast.success('Email alterado com sucesso! Faça login novamente.');
            setEmailData({ newEmail: '', password: '' });

            // Logout após 2 segundos
            setTimeout(() => {
                logout();
            }, 2000);
        } catch (error) {
            console.error('Erro ao alterar email:', error);
            toast.error(error.response?.data?.message || 'Erro ao alterar email');
        } finally {
            setLoadingEmail(false);
        }
    };

    // Alterar Senha
    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            toast.error('Preencha todos os campos');
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('As senhas não coincidem');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            toast.error('A nova senha deve ter pelo menos 6 caracteres');
            return;
        }

        setLoadingPassword(true);
        try {
            const response = await axios.put(
                `${API_URL}/api/users/update-password`,
                {
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            toast.success('Senha alterada com sucesso!');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            console.error('Erro ao alterar senha:', error);
            toast.error(error.response?.data?.message || 'Erro ao alterar senha');
        } finally {
            setLoadingPassword(false);
        }
    };

    return (
        <div className="configuracoes-content">
            <h1>Configurações da Conta</h1>
            <p className="subtitle">Gerencie suas informações de acesso</p>

            {/* Seção: Alterar Email */}
            <section className="config-section">
                <h2>Alterar Email</h2>
                <p className="section-description">
                    Email atual: <strong>{user?.email}</strong>
                </p>

                <form onSubmit={handleEmailChange} className="config-form">
                    <div className="form-group">
                        <label htmlFor="newEmail">Novo Email:</label>
                        <input
                            type="email"
                            id="newEmail"
                            value={emailData.newEmail}
                            onChange={(e) => setEmailData({ ...emailData, newEmail: e.target.value })}
                            placeholder="Digite o novo email"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="emailPassword">Senha Atual (para confirmar):</label>
                        <input
                            type="password"
                            id="emailPassword"
                            value={emailData.password}
                            onChange={(e) => setEmailData({ ...emailData, password: e.target.value })}
                            placeholder="Digite sua senha atual"
                            required
                        />
                    </div>

                    <button type="submit" className="btn-save" disabled={loadingEmail}>
                        {loadingEmail ? 'Alterando...' : 'Alterar Email'}
                    </button>
                </form>
            </section>

            {/* Seção: Alterar Senha */}
            <section className="config-section">
                <h2>Alterar Senha</h2>
                <p className="section-description">
                    Mantenha sua conta segura com uma senha forte
                </p>

                <form onSubmit={handlePasswordChange} className="config-form">
                    <div className="form-group">
                        <label htmlFor="currentPassword">Senha Atual:</label>
                        <input
                            type="password"
                            id="currentPassword"
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            placeholder="Digite sua senha atual"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="newPassword">Nova Senha:</label>
                        <input
                            type="password"
                            id="newPassword"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            placeholder="Digite a nova senha (mínimo 6 caracteres)"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirmar Nova Senha:</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            placeholder="Digite a nova senha novamente"
                            required
                        />
                    </div>

                    <button type="submit" className="btn-save" disabled={loadingPassword}>
                        {loadingPassword ? 'Alterando...' : 'Alterar Senha'}
                    </button>
                </form>
            </section>
        </div>
    );
}
