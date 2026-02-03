import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, Trash2, ChevronRight, ChevronLeft, MoreVertical, Layout } from 'lucide-react';
import api from '../api/config';

const KanbanBoard = ({ tasks, fetchTasks }) => {
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [priority, setPriority] = useState('Normal');
    const [isAdding, setIsAdding] = useState(false);

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

    const addTask = async (e) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;
        try {
            await api.post('/tasks', { title: newTaskTitle, status: 'todo', priority });
            setNewTaskTitle('');
            setIsAdding(false);
            fetchTasks();
        } catch (e) {
            console.error("Error al añadir tarea:", e);
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

    return (
        <div className="animate-fade-in">
            <header style={headerStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="glass-card" style={iconBadgeStyle}><Layout size={20} color="var(--primary)" /></div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.5px' }}>Tablero de Proyectos</h1>
                </div>
                <button className="btn-premium" onClick={() => setIsAdding(!isAdding)}>
                    <Plus size={20} /> Nueva Tarea
                </button>
            </header>

            {isAdding && (
                <form className="glass-card animate-fade-in" onSubmit={addTask} style={addFormStyle}>
                    <input
                        className="input-premium"
                        style={{ flex: 1 }}
                        placeholder="¿Qué tarea tienes pendiente?"
                        value={newTaskTitle}
                        onChange={e => setNewTaskTitle(e.target.value)}
                        autoFocus
                    />
                    <select
                        className="input-premium"
                        value={priority}
                        onChange={e => setPriority(e.target.value)}
                        style={{ width: '140px' }}
                    >
                        <option>Normal</option>
                        <option>Alta</option>
                        <option>Urgente</option>
                    </select>
                    <button className="btn-premium" type="submit">Añadir</button>
                    <button className="btn-premium" style={{ background: '#e2e8f0', color: '#475569' }} onClick={() => setIsAdding(false)}>Cancelar</button>
                </form>
            )}

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
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                                            <p style={{ fontWeight: '600', fontSize: '0.95rem', lineHeight: '1.4' }}>{task.title}</p>
                                                            <button onClick={() => deleteTask(task._id)} style={deleteBtnStyle}><Trash2 size={14} /></button>
                                                        </div>
                                                        <div style={taskFooterStyle}>
                                                            <span style={priorityBadgeStyle(task.priority)}>{task.priority}</span>
                                                            <MoreVertical size={14} color="var(--text-muted)" />
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
        </div>
    );
};

// Estilos internos
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' };
const iconBadgeStyle = { width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const addFormStyle = { padding: '24px', display: 'flex', gap: '12px', marginBottom: '32px', alignItems: 'center' };
const boardStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', alignItems: 'start' };
const columnContainerStyle = { display: 'flex', flexDirection: 'column', gap: '16px' };
const columnHeaderStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px' };
const badgeStyle = { background: 'white', padding: '2px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '800', border: '1px solid var(--border-color)' };
const columnBodyStyle = { minHeight: '500px', borderRadius: '20px', transition: 'background 0.2s ease' };
const taskCardStyle = { padding: '16px', marginBottom: '16px', cursor: 'grab', background: 'white' };
const deleteBtnStyle = { border: 'none', background: 'transparent', cursor: 'pointer', color: '#cbd5e1', transition: 'color 0.2s' };
const taskFooterStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' };
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
