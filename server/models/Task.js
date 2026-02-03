const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    status: { type: String, enum: ['todo', 'doing', 'done'], default: 'todo' },
    priority: { type: String, default: 'Normal' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

module.exports = mongoose.model('Task', TaskSchema);