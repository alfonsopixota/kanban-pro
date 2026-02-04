import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, Trash2, Edit2, Calendar, Layout } from 'lucide-react';
import api from '../api/config';
import TaskModal from './TaskModal';

const KanbanBoard = ({ tasks, fetchTasks }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);

    const columns = {
        todo: { name: 'Por hacer', items: tasks.filter(t => t.status === 'todo') },
        doing: { name: 'En progreso', items: tasks.filter(t => t.status === 'doing') },
        done: { name: 'Completado', items: tasks.filter(t => t.status === 'done') }
    };

    const onDragEnd = async (result) => {
        if (!result.destination) return;
        const { draggableId, destination } = result;

        try {
            await api.put(`/tasks/${draggableId}`, { status: destination.droppableId });
            fetchTasks();
        } catch (e) {
            console.error("Error al mover tarea:", e);
        }
    };

    const openCreateModal = () => {
        setEditingTask(null);
        setIsModalOpen(true);
    };

    const openEditModal = (task) => {
        setEditingTask(task);
        setIsModalOpen(true);
    };

    const handleSaveTask = async (formData) => {
        try {
            if (editingTask) {
                // Update existing task
                await api.put(`/tasks/${editingTask._id}`, formData);
            } else {
                // Create new task
                await api.post('/tasks', { ...formData, status: 'todo' });
            }
            fetchTasks();
            setIsModalOpen(false);
            setEditingTask(null);
        } catch (e) {
            console.error("Error al guardar tarea:", e);
        }
    };

    const deleteTask = async (id) => {
        if (window.confirm("¿Seguro que quieres eliminar esta tarea?")) {
            try {
                await api.delete(`/tasks/${id}`);
                fetchTasks();
            } catch (e) {
                console.error("Error al borrar tarea:", e);
            }
        }
    };

    // Helper to format date
    const formatDate = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    };

    // Check if overdue
    const isOverdue = (dateString) => {
        if (!dateString) return false;
        return new Date(dateString) < new Date().setHours(0, 0, 0, 0);
    };

    return (
        <div className="animate-fade-in">
            <header style={headerStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="glass-card" style={iconBadgeStyle}><Layout size={20} color="var(--primary)" /></div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.5px' }}>Tablero de Proyectos</h1>
                </div>
                <button className="btn-premium" onClick={openCreateModal}>
                    <Plus size={20} /> Nueva Tarea
                </button>
            </header>

            <DragDropContext onDragEnd={onDragEnd}>
                <div style={boardStyle}>
                    {Object.entries(columns).map(([id, column]) => (
                        <div key={id} style={columnContainerStyle}>
                            <div style={columnHeaderStyle}>
                                <h3 style={{ fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
                                    {column.name}
                                </h3>
                                <span style={badgeStyle}>{column.items.length}</span>
                            </div>

                            <Droppable droppableId={id}>
                                {(provided, snapshot) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        style={{
                                            ...columnBodyStyle,
                                            background: snapshot.isDraggingOver ? 'rgba(99, 102, 241, 0.05)' : 'transparent',
                                        }}
                                    >
                                        {column.items.map((task, index) => (
                                            <Draggable key={task._id} draggableId={task._id} index={index}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className="glass-card"
                                                        style={{
                                                            ...taskCardStyle,
                                                            ...provided.draggableProps.style,
                                                            opacity: snapshot.isDragging ? 0.8 : 1,
                                                            borderLeft: `5px solid ${task.priority === 'Urgente' ? '#ef4444' : task.priority === 'Alta' ? '#f59e0b' : '#3b82f6'}`
                                                        }}
                                                    >
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                                                            <p style={{ fontWeight: '600', fontSize: '0.95rem', lineHeight: '1.4', flex: 1 }}>{task.title}</p>
                                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                                <button onClick={() => openEditModal(task)} style={actionBtnStyle}><Edit2 size={14} /></button>
                                                                <button onClick={() => deleteTask(task._id)} style={{ ...actionBtnStyle, color: '#ef4444' }}><Trash2 size={14} /></button>
                                                            </div>
                                                        </div>

                                                        {/* Description Preview (optional) */}
                                                        {task.description && (
                                                            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                                {task.description}
                                                            </p>
                                                        )}

                                                        <div className="task-meta">
                                                            <span style={priorityBadgeStyle(task.priority)}>{task.priority}</span>

                                                            {task.dueDate && (
                                                                <span className="date-badge" style={{ color: isOverdue(task.dueDate) ? '#ef4444' : 'inherit' }}>
                                                                    <Calendar size={12} /> {formatDate(task.dueDate)}
                                                                </span>
                                                            )}

                                                            {task.tags && task.tags.map(tag => (
                                                                <span key={tag} style={{ fontSize: '0.7rem', background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', color: '#475569' }}>
                                                                    #{tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    ))}
                </div>
            </DragDropContext>

            <TaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveTask}
                task={editingTask}
            />
        </div>
    );
};

// Estilos internos
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' };
const iconBadgeStyle = { width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const boardStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', alignItems: 'start' };
const columnContainerStyle = { display: 'flex', flexDirection: 'column', gap: '16px' };
const columnHeaderStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px' };
const badgeStyle = { background: 'white', padding: '2px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '800', border: '1px solid var(--border-color)' };
const columnBodyStyle = { minHeight: '500px', borderRadius: '20px', transition: 'background 0.2s ease' };
const taskCardStyle = { padding: '16px', marginBottom: '16px', cursor: 'grab', background: 'white', position: 'relative' };
const actionBtnStyle = { border: 'none', background: 'transparent', cursor: 'pointer', color: '#cbd5e1', padding: '4px', borderRadius: '4px', transition: 'all 0.2s' };
const priorityBadgeStyle = (p) => ({
    fontSize: '0.7rem',
    fontWeight: '700',
    padding: '4px 8px',
    borderRadius: '6px',
    textTransform: 'uppercase',
    background: p === 'Urgente' ? '#fee2e2' : p === 'Alta' ? '#fef3c7' : '#e0e7ff',
    color: p === 'Urgente' ? '#991b1b' : p === 'Alta' ? '#92400e' : '#3730a3'
});

export default KanbanBoard;
