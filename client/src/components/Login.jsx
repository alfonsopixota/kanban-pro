import React, { useState } from 'react';
import api from '../api/config';
import { Mail, Lock, LogIn, UserPlus, Layout } from 'lucide-react';

const Login = ({ setToken }) => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const path = isRegistering ? '/auth/register' : '/auth/login';
        try {
            const res = await api.post(path, { email, password });
            if (isRegistering) {
                alert("¡Cuenta creada con éxito! Ya puedes iniciar sesión.");
                setIsRegistering(false);
            } else {
                localStorage.setItem('token', res.data.token);
                setToken(res.data.token);
            }
        } catch (err) {
            alert(err.response?.data?.error || "Ocurrió un error inesperado");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="glass-card animate-fade-in login-card">
                <div className="login-header">
                    <div className="login-logo">
                        <Layout size={40} color="var(--primary)" />
                    </div>
                    <h2 className="login-title">
                        {isRegistering ? 'Crea tu cuenta' : 'Kanban Pro Premium'}
                    </h2>
                    <p className="login-subtitle">
                        {isRegistering ? 'Empieza a gestionar tus proyectos hoy mismo' : 'Tu organización al siguiente nivel'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label className="label-premium">Email</label>
                        <div className="login-input-wrapper">
                            <Mail size={18} className="login-icon" />
                            <input
                                className="input-premium login-input"
                                type="email"
                                placeholder="tu@email.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="label-premium">Contraseña</label>
                        <div className="login-input-wrapper">
                            <Lock size={18} className="login-icon" />
                            <input
                                className="input-premium login-input"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button className="btn-premium login-submit" disabled={loading}>
                        {loading ? 'Procesando...' : (isRegistering ? <><UserPlus size={20} /> Registrarme</> : <><LogIn size={20} /> Iniciar Sesión</>)}
                    </button>
                </form>

                <div className="login-footer">
                    <p onClick={() => setIsRegistering(!isRegistering)} className="login-toggle">
                        {isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate gratis'}
                    </p>
                </div>
            </div>

            <style>{`
                .login-page { height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
                .login-card { padding: 48px 40px; width: 100%; maxWidth: 440px; text-align: center; }
                .login-header { margin-bottom: 32px; }
                .login-logo { margin-bottom: 20px; display: inline-flex; padding: 16px; background: var(--column-bg); border-radius: 16px; border: 1px solid var(--border-color); }
                .login-title { font-size: 1.8rem; font-weight: 900; letter-spacing: -1px; margin-bottom: 8px; }
                .login-subtitle { color: var(--text-muted); font-size: 0.95rem; }
                .login-form { display: flex; flex-direction: column; gap: 20px; text-align: left; }
                .login-input-wrapper { position: relative; }
                .login-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: var(--text-muted); pointer-events: none; }
                .login-input { padding-left: 48px !important; }
                .login-submit { margin-top: 10px; width: 100%; height: 50px; font-size: 1rem; }
                .login-footer { margin-top: 24px; }
                .login-toggle { font-size: 0.9rem; color: var(--primary); cursor: pointer; font-weight: 700; transition: all 0.2s; }
                .login-toggle:hover { opacity: 0.8; text-decoration: underline; }
            `}</style>
        </div>
    );
};

export default Login;
