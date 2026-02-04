import React, { useState, useEffect } from 'react';
import { X, Calendar, Tag } from 'lucide-react';

const TaskModal = ({ isOpen, onClose, onSave, task = null }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'Normal',
        dueDate: '',
        tags: []
    });

    const [tagInput, setTagInput] = useState('');

    useEffect(() => {
        if (task) {
            setFormData({
                title: task.title || '',
                description: task.description || '',
                priority: task.priority || 'Normal',
                dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
                tags: task.tags || []
            });
        } else {
            setFormData({
                title: '',
                description: '',
                priority: 'Normal',
                dueDate: '',
                tags: []
            });
        }
    }, [task, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTagKeyDown = (e) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            if (!formData.tags.includes(tagInput.trim())) {
                setFormData(prev => ({
                    ...prev,
                    tags: [...prev.tags, tagInput.trim()]
                }));
            }
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                        {task ? 'Editar Tarea' : 'Nueva Tarea'}
                    </h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <X size={24} color="#64748b" />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Título</label>
                        <input
                            name="title"
                            className="form-input"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Ej: Diseñar Home Page"
                            autoFocus
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Descripción</label>
                        <textarea
                            name="description"
                            className="form-textarea"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Añade detalles, subtareas o notas..."
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group">
                            <label className="form-label">Prioridad</label>
                            <select
                                name="priority"
                                className="form-select"
                                value={formData.priority}
                                onChange={handleChange}
                            >
                                <option>Normal</option>
                                <option>Alta</option>
                                <option>Urgente</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Fecha Vencimiento</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="date"
                                    name="dueDate"
                                    className="form-input"
                                    value={formData.dueDate}
                                    onChange={handleChange}
                                />
                                <Calendar size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#94a3b8' }} />
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Etiquetas</label>
                        <div className="tags-input-container" onClick={() => document.getElementById('tag-input').focus()}>
                            {formData.tags.map(tag => (
                                <span key={tag} className="tag-pill">
                                    {tag}
                                    <span className="tag-remove" onClick={() => removeTag(tag)}>×</span>
                                </span>
                            ))}
                            <input
                                id="tag-input"
                                className="tag-input"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleTagKeyDown}
                                placeholder={formData.tags.length === 0 ? "Escribe y pulsa Enter..." : ""}
                            />
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-premium btn-secondary" onClick={onClose}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-premium">
                            {task ? 'Guardar Cambios' : 'Crear Tarea'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TaskModal;
