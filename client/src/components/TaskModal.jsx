import React, { useState, useEffect } from 'react';
import { X, Calendar } from 'lucide-react';

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
            <div className="modal-content animate-fade-in" onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: '800', letterSpacing: '-0.5px' }}>
                        {task ? 'Editar Tarea' : 'Nueva Tarea'}
                    </h2>
                    <button onClick={onClose} className="btn-icon">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="label-premium">Título de la tarea</label>
                        <input
                            name="title"
                            className="input-premium"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Ej: Diseñar Home Page"
                            autoFocus
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="label-premium">Descripción</label>
                        <textarea
                            name="description"
                            className="input-premium"
                            style={{ minHeight: '100px', resize: 'vertical' }}
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Añade detalles, subtareas o notas..."
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group">
                            <label className="label-premium">Prioridad</label>
                            <select
                                name="priority"
                                className="input-premium"
                                style={{ cursor: 'pointer' }}
                                value={formData.priority}
                                onChange={handleChange}
                            >
                                <option>Normal</option>
                                <option>Alta</option>
                                <option>Urgente</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="label-premium">Vencimiento</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="date"
                                    name="dueDate"
                                    className="input-premium"
                                    value={formData.dueDate}
                                    onChange={handleChange}
                                />
                                <Calendar size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} />
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="label-premium">Etiquetas (Pulsa Enter)</label>
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
                                style={{ color: 'var(--text-main)' }}
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleTagKeyDown}
                                placeholder={formData.tags.length === 0 ? "Escribe..." : ""}
                            />
                        </div>
                    </div>

                    <div className="modal-actions" style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                        <button type="button" className="btn-premium" style={{ background: 'var(--border-color)', color: 'var(--text-main)', flex: 1 }} onClick={onClose}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-premium" style={{ flex: 2 }}>
                            {task ? 'Guardar Cambios' : 'Crear Tarea'}
                        </button>
                    </div>
                </form>
            </div>

            <style>{`
                .tags-input-container { display: flex; flex-wrap: wrap; gap: 8px; padding: 10px; border: 1px solid var(--border-color); border-radius: 12px; background: var(--input-bg); min-height: 52px; }
                .tag-pill { background: var(--primary); color: white; padding: 4px 10px; border-radius: 8px; font-size: 0.75rem; font-weight: 700; display: flex; align-items: center; gap: 6px; }
                .tag-remove { cursor: pointer; font-size: 1.1rem; opacity: 0.8; }
                .tag-input { border: none; background: transparent; flex: 1; min-width: 60px; outline: none; }
            `}</style>
        </div>
    );
};

export default TaskModal;
