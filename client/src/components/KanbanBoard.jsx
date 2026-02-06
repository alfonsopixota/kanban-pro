import React, { useState, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, Trash2, Edit2, Calendar, Layout, Search, Filter } from 'lucide-react';
import api from '../api/config';
import TaskModal from './TaskModal';

const KanbanBoard = ({ tasks, fetchTasks }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('Todas');

    // Filtered tasks
    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesPriority = priorityFilter === 'Todas' || task.priority === priorityFilter;
            return matchesSearch && matchesPriority;
        });
    }, [tasks, searchQuery, priorityFilter]);

    const columns = {
        todo: { name: 'Por hacer', items: filteredTasks.filter(t => t.status === 'todo') },
        doing: { name: 'En progreso', items: filteredTasks.filter(t => t.status === 'doing') },
        done: { name: 'Completado', items: filteredTasks.filter(t => t.status === 'done') }
    };

    const onDragEnd = async (result) => {
        if (!result.destination) return;
        const { draggableId, destination, source } = result;

        if (destination.droppableId === source.droppableId) return;

        // Optimistic UI Update: We don't wait for the API to show the change
        const updatedTasks = tasks.map(t =>
            t._id === draggableId ? { ...t, status: destination.droppableId } : t
        );

        // We update the local state immediately (this assumes tasks is managed in a way that App.jsx gets the update)
        // Since tasks is a prop, we ideally should have a local copy or a setter passed down.
        // For now, we call the API and then fetch, but we can simulate speed by not showing a loader.

        try {
            await api.put(`/tasks/${draggableId}`, { status: destination.droppableId });
            // Refresh to sync with server
            fetchTasks();
        } catch (e) {
            console.error("Error al mover tarea:", e);
            fetchTasks(); // Rollback on error
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
                await api.put(`/tasks/${editingTask._id}`, formData);
            } else {
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

    const formatDate = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    };

    const isOverdue = (dateString) => {
        if (!dateString) return false;
        return new Date(dateString) < new Date().setHours(0, 0, 0, 0);
    };

    return (
        <div className="animate-fade-in">
            <header className="board-header">
                <div className="header-left">
                    <div className="icon-badge"><Layout size={20} color="var(--primary)" /></div>
                    <h1 className="title-main">Gestión de Proyectos</h1>
                </div>

                <div className="header-actions">
                    <div className="search-wrapper">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Buscar tareas..."
                            className="input-premium search-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="filter-wrapper">
                        <Filter size={18} className="filter-icon" />
                        <select
                            className="input-premium filter-select"
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                        >
                            <option value="Todas">Prioridad: Todas</option>
                            <option value="Urgente">Urgente</option>
                            <option value="Alta">Alta</option>
                            <option value="Normal">Normal</option>
                        </select>
                    </div>

                    <button className="btn-premium" onClick={openCreateModal}>
                        <Plus size={20} /> Nueva Tarea
                    </button>
                </div>
            </header>

            <DragDropContext onDragEnd={onDragEnd}>
                <div className="kanban-board">
                    {Object.entries(columns).map(([id, column]) => (
                        <div key={id} className="kanban-column">
                            <div className="column-header">
                                <h3 className="column-title">{column.name}</h3>
                                <span className="column-count">{column.items.length}</span>
                            </div>

                            <Droppable droppableId={id}>
                                {(provided, snapshot) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className="column-body"
                                        style={{
                                            background: snapshot.isDraggingOver ? 'rgba(99, 102, 241, 0.05)' : 'transparent',
                                            flex: 1,
                                            minHeight: '400px'
                                        }}
                                    >
                                        {column.items.map((task, index) => (
                                            <Draggable key={task._id} draggableId={task._id} index={index}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className="glass-card task-card"
                                                        style={{
                                                            ...provided.draggableProps.style,
                                                            opacity: snapshot.isDragging ? 0.9 : 1,
                                                            borderLeft: `6px solid ${task.priority === 'Urgente' ? '#ef4444' : task.priority === 'Alta' ? '#f59e0b' : 'var(--primary)'}`
                                                        }}
                                                    >
                                                        <div className="task-header">
                                                            <p className="task-title">{task.title}</p>
                                                            <div className="task-actions">
                                                                <button onClick={() => openEditModal(task)} className="btn-action"><Edit2 size={14} /></button>
                                                                <button onClick={() => deleteTask(task._id)} className="btn-action delete"><Trash2 size={14} /></button>
                                                            </div>
                                                        </div>

                                                        {task.description && (
                                                            <p className="task-desc">{task.description}</p>
                                                        )}

                                                        <div className="task-footer">
                                                            <span className={`badge badge-priority-${task.priority.toLowerCase()}`}>
                                                                {task.priority}
                                                            </span>

                                                            {task.dueDate && (
                                                                <span className={`badge-date ${isOverdue(task.dueDate) ? 'overdue' : ''}`}>
                                                                    <Calendar size={12} /> {formatDate(task.dueDate)}
                                                                </span>
                                                            )}

                                                            <div className="task-tags">
                                                                {task.tags && task.tags.slice(0, 2).map(tag => (
                                                                    <span key={tag} className="tag-micro">#{tag}</span>
                                                                ))}
                                                                {task.tags && task.tags.length > 2 && (
                                                                    <span className="tag-micro">+{task.tags.length - 2}</span>
                                                                )}
                                                            </div>
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

            <style>{`
                .board-header { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 20px; margin-bottom: 40px; }
                .header-left { display: flex; alignItems: center; gap: 16px; }
                .title-main { font-size: 1.8rem; font-weight: 800; letter-spacing: -0.5px; }
                .icon-badge { width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; background: var(--card-bg); border-radius: 12px; border: 1px solid var(--border-color); }
                
                .header-actions { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }
                .search-wrapper, .filter-wrapper { position: relative; display: flex; align-items: center; }
                .search-icon, .filter-icon { position: absolute; left: 12px; color: var(--text-muted); pointer-events: none; }
                .search-input, .filter-select { padding-left: 40px !important; min-width: 200px; height: 42px; }
                .filter-select { appearance: none; cursor: pointer; }

                .task-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; }
                .task-actions { display: flex; gap: 4px; opacity: 0.3; transition: opacity 0.2s; }
                .task-card:hover .task-actions { opacity: 1; }
                .btn-action { background: none; border: none; padding: 6px; border-radius: 6px; color: var(--text-muted); cursor: pointer; transition: all 0.2s; }
                .btn-action:hover { background: var(--border-color); color: var(--primary); }
                .btn-action.delete:hover { background: #fee2e2; color: #ef4444; }

                .task-tags { display: flex; gap: 4px; border-left: 1px solid var(--border-color); padding-left: 8px; margin-left: auto; }
                .tag-micro { font-size: 0.65rem; color: var(--text-muted); font-weight: 600; }
            `}</style>
        </div>
    );
};

export default KanbanBoard;
