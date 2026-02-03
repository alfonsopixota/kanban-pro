import React, { useState } from 'react';
import api from '../api/config';
import { Mail, Lock, LogIn, UserPlus } from 'lucide-react';

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
        <div style={containerStyle}>
            <div className="glass-card animate-fade-in" style={cardStyle}>
                <div style={headerStyle}>
                    <div style={logoStyle}>📊</div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '8px' }}>
                        {isRegistering ? 'Crea tu cuenta' : '¡Bienvenido de nuevo!'}
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        {isRegistering ? 'Empieza a organizar tus proyectos hoy mismo' : 'Gestiona tus tareas con Kanban Pro'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={inputGroupStyle}>
                        <Mail size={18} style={iconStyle} />
                        <input
                            className="input-premium"
                            style={{ width: '100%', paddingLeft: '44px' }}
                            type="email"
                            placeholder="Tu correo electrónico"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div style={inputGroupStyle}>
                        <Lock size={18} style={iconStyle} />
                        <input
                            className="input-premium"
                            style={{ width: '100%', paddingLeft: '44px' }}
                            type="password"
                            placeholder="Tu contraseña secreta"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button className="btn-premium" style={{ marginTop: '8px' }} disabled={loading}>
                        {loading ? 'Procesando...' : (isRegistering ? <><UserPlus size={20} /> Registrarme</> : <><LogIn size={20} /> Entrar ahora</>)}
                    </button>
                </form>

                <p onClick={() => setIsRegistering(!isRegistering)} style={toggleStyle}>
                    {isRegistering ? '¿Ya tienes cuenta? Inicia sesión aquí' : '¿Aún no tienes cuenta? Regístrate gratis'}
                </p>
            </div>
        </div>
    );
};

const containerStyle = {
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px'
};

const cardStyle = {
    padding: '48px 40px',
    width: '100%',
    maxWidth: '420px',
    textAlign: 'center'
};

const headerStyle = {
    marginBottom: '32px'
};

const logoStyle = {
    fontSize: '3rem',
    marginBottom: '16px'
};

const inputGroupStyle = {
    position: 'relative',
    width: '100%'
};

const iconStyle = {
    position: 'absolute',
    left: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--text-muted)'
};

const toggleStyle = {
    marginTop: '24px',
    fontSize: '0.9rem',
    color: 'var(--primary)',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'color 0.2s ease'
};

export default Login;