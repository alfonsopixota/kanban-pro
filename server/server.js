const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// 1. MIDDLEWARES
app.use(cors());
app.use(express.json());

// 2. CONEXIÓN A MONGODB
let dbError = null;
const mongoUri = process.env.MONGO_URI ? process.env.MONGO_URI.trim() : null;

mongoose.connect(mongoUri)
    .then(() => {
        console.log('✅ MongoDB Conectado (Producción)');
        dbError = null;
    })
    .catch(err => {
        console.error('❌ Error conexión MongoDB:', err);
        dbError = err.message;
    });

// 3. RUTAS
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Servidor funcionando',
        database: mongoose.connection.readyState === 1 ? 'Conectado' : 'Desconectado',
        error: dbError,
        env: {
            hasMongo: !!process.env.MONGO_URI,
            hasJwt: !!process.env.JWT_SECRET,
            port: process.env.PORT
        }
    });
});
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));

// 4. ARRANQUE DEL SERVIDOR
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor listo en puerto ${PORT}`);
});
