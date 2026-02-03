const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const auth = require('../middleware/auth_middleware'); // Middleware de protección

// Obtener todas las tareas del usuario
router.get('/', auth, async (req, res) => {
    try {
        const tasks = await Task.find({ userId: req.userId });
        console.log(`✅ Tareas obtenidas para el usuario: ${req.userId}`);
        res.json(tasks);
    } catch (e) {
        console.error("Error en GET /tasks:", e);
        res.status(500).json({ error: "Error al obtener tareas" });
    }
});

// Crear una nueva tarea
router.post('/', auth, async (req, res) => {
    try {
        const task = new Task({ ...req.body, userId: req.userId });
        await task.save();
        console.log(`✅ Tarea creada: ${task.title}`);
        res.status(201).json(task);
    } catch (e) {
        console.error("Error en POST /tasks:", e);
        res.status(400).json({ error: "Error al crear la tarea" });
    }
});

// Actualizar una tarea
router.put('/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            req.body,
            { new: true }
        );
        if (!task) return res.status(404).json({ error: "Tarea no encontrada" });
        console.log(`✅ Tarea actualizada: ${task._id} a estado ${task.status}`);
        res.json(task);
    } catch (e) {
        console.error("Error en PUT /tasks:", e);
        res.status(400).json({ error: "Error al actualizar la tarea" });
    }
});

// Eliminar una tarea
router.delete('/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.userId });
        if (!task) return res.status(404).json({ error: "Tarea no encontrada" });
        res.json({ message: "Tarea eliminada" });
    } catch (e) {
        res.status(500).json({ error: "Error al borrar la tarea" });
    }
});

module.exports = router;
