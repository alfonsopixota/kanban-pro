import React, { useState, useEffect } from 'react';
import api from './api/config';
import Login from './components/Login';
import KanbanBoard from './components/KanbanBoard';
import { LogOut, Moon, Sun } from 'lucide-react';

function App() {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [tasks, setTasks] = useState([]);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        if (token) fetchTasks();
    }, [token]);

    const fetchTasks = async () => {
        try {
            const res = await api.get('/tasks');
            setTasks(res.data);
        } catch (e) {
            console.error("Error al obtener tareas:", e);
            if (e.response?.status === 401) {
                handleLogout();
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setToken(null);
    };

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    if (!token) {
        return <Login setToken={setToken} />;
    }

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px' }}>
            <nav className="glass-card" style={navStyle}>
                <div style={{ fontSize: '0.85rem', fontWeight: '800', opacity: 0.6, letterSpacing: '1.5px', color: 'var(--primary)' }}>KANBAN PRO v2.1</div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button className="btn-icon" onClick={toggleTheme} title="Cambiar tema">
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>

                    <button
                        className="btn-premium"
                        style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '8px 16px' }}
                        onClick={handleLogout}
                    >
                        <LogOut size={16} /> Salir
                    </button>
                </div>
            </nav>

            <KanbanBoard tasks={tasks} fetchTasks={fetchTasks} />
        </div>
    );
}

const navStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '48px',
    padding: '16px 24px',
    borderRadius: '16px'
};

export default App;
