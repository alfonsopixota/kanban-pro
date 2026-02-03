import axios from 'axios';

const api = axios.create({
    // baseURL: 'https://kanban-pro-v6fa.onrender.com/api' // URL de Producción
    baseURL: 'http://localhost:5001/api' // URL Local para pruebas (cambiado a 5001)
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