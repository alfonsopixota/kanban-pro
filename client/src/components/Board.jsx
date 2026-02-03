import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, Trash2, LogOut, Layout } from 'lucide-react';
import api from '../api/config';

const Board = () => {
    const [tasks, setTasks] = useState([]);
    const [newTitle, setNewTitle] = useState('');

    useEffect(() => { fetchTasks(); }, []);

    const fetchTasks = async () => {
        const res = await api.get('/tasks');
        setTasks(res.data);
    };

    const addTask = async (e) => {
        e.preventDefault();
        if (!newTitle.trim()) return;
        await api.post('/tasks', { title: newTitle, status: 'todo' });
        setNewTitle('');
        fetchTasks();
    };

    const onDragEnd = async (result) => {
        const { destination, source, draggableId } = result;
        if (!destination || (destination.droppableId === source.droppableId)) return;

        setTasks(tasks.map(t => t._id === draggableId ? { ...t, status: destination.droppableId } : t));
        await api.patch(`/tasks/${draggableId}`, { status: destination.droppableId });
    };

    const logout = () => {
        localStorage.removeItem('token');
        window.location.reload();
    };

    const columns = [
        { id: 'todo', title: 'Pendiente', color: 'bg-slate-100' },
        { id: 'in-progress', title: 'En Curso', color: 'bg-blue-50' },
        { id: 'done', title: 'Completado', color: 'bg-green-50' }
    ];

    return (
        <div className="min-h-screen bg-white">
            <nav className="border-b border-slate-100 px-8 py-4 flex justify-between items-center">
                <div className="flex items-center gap-2 font-black text-xl text-slate-800 italic">
                    <Layout className="text-indigo-600" /> KANBAN.PRO
                </div>
                <button onClick={logout} className="flex items-center gap-2 text-slate-400 hover:text-red-500 transition-colors">
                    <LogOut size={18} /> <span className="text-sm font-medium">Salir</span>
                </button>
            </nav>

            <div className="p-8">
                <form onSubmit={addTask} className="max-w-md mb-10 flex gap-2">
                    <input
                        value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                        className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                        placeholder="Añadir nueva tarea..."
                    />
                    <button className="bg-indigo-600 text-white px-4 rounded-xl hover:bg-indigo-700 transition-all"><Plus /></button>
                </form>

                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="flex flex-col md:flex-row gap-6">
                        {columns.map(col => (
                            <Droppable key={col.id} droppableId={col.id}>
                                {(provided) => (
                                    <div {...provided.droppableProps} ref={provided.innerRef} className={`${col.color} p-5 rounded-3xl w-full md:w-80 min-h-[500px]`}>
                                        <h3 className="font-bold text-slate-500 text-xs uppercase tracking-widest mb-4 px-2">{col.title}</h3>
                                        {tasks.filter(t => t.status === col.id).map((task, index) => (
                                            <Draggable key={task._id} draggableId={task._id} index={index}>
                                                {(provided) => (
                                                    <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="bg-white p-4 rounded-2xl shadow-sm mb-3 border border-slate-200 group">
                                                        <p className="text-slate-700 font-medium">{task.title}</p>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        ))}
                    </div>
                </DragDropContext>
            </div>
        </div>
    );
};

export default Board;