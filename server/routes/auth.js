const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Registro de usuario
router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "El email ya está registrado" });
        }

        const user = new User({ email, password });
        await user.save();
        res.status(201).json({ message: "Usuario creado correctamente" });
    } catch (e) {
        console.error("Error en /register:", e);
        res.status(400).json({ error: "Error al crear el usuario", details: e.message });
    }
});

// Login de usuario
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ error: "Credenciales incorrectas" });
        }

        // Comparar contraseña (bcrypt maneja esto a través del modelo o manual)
        // Como User.js ya tiene el middleware pre-save para el hash, necesitamos un método de comparación
        // O lo hacemos aquí manualmente si el modelo no tiene el método:
        const bcrypt = require('bcryptjs');
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ error: "Credenciales incorrectas" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'CLAVE_POR_DEFECTO');
        res.json({ token });
    } catch (e) {
        console.error("Error en /login:", e);
        res.status(500).json({ error: "Error en el servidor", details: e.message });
    }
});

module.exports = router;
