import axios from 'axios';

const api = axios.create({
    baseURL: 'https://kanban-pro-server.onrender.com/api' // URL de Producción en Render
    // baseURL: 'http://localhost:5000/api' // URL Local para pruebas
});

// Esto es importante para que el token de seguridad se envíe siempre
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;