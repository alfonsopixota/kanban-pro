import React, { useState, useEffect } from 'react';
import api from './api/config';
import Login from './components/Login';
import KanbanBoard from './components/KanbanBoard';
import { LogOut } from 'lucide-react';

function App() {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [tasks, setTasks] = useState([]);

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
                localStorage.removeItem('token');
                setToken(null);
            }
        }
    };

    if (!token) {
        return <Login setToken={setToken} />;
    }

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
            <nav style={navStyle}>
                <div style={{ opacity: 0.5, fontSize: '0.8rem', fontWeight: '600', letterSpacing: '1px' }}>KANBAN PRO v2.0</div>
                <button
                    className="btn-premium"
                    style={{ background: '#fee2e2', color: '#991b1b', padding: '8px 16px', fontSize: '0.85rem' }}
                    onClick={() => { localStorage.removeItem('token'); setToken(null); }}
                >
                    <LogOut size={16} /> Salir
                </button>
            </nav>

            <KanbanBoard tasks={tasks} fetchTasks={fetchTasks} />
        </div>
    );
}

const navStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '60px',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '20px'
};

export default App;
