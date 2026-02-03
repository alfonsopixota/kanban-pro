const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Ajusta según tu carpeta
const jwt = require('jsonwebtoken');

router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = new User({ email, password });
        await user.save();
        res.status(201).json({ message: "Usuario creado" });
    } catch (error) {
        res.status(400).json({ error: "Error al crear usuario" });
    }
});

// ... aquí iría el router.post('/login')

module.exports = router;