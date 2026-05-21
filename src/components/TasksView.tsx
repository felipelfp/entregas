import React, { useState, useMemo, useEffect } from 'react';
import { Task } from './TaskModal';
import TaskModal from './TaskModal';
import './TasksView.css';
import { api } from '../services/api';

interface TasksViewProps {
    tasks: Task[];
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
    objectives?: any[];
    debts?: any[];
}

const TasksView: React.FC<TasksViewProps> = ({ tasks, setTasks, objectives = [], debts = [] }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Partial<Task> | undefined>(undefined);
    const [viewMode, setViewMode] = useState<'timeline' | 'kanban'>('kanban');
    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
    const [dragOverColId, setDragOverColId] = useState<string | null>(null);

    const [columnLabels, setColumnLabels] = useState<Record<string, string>>(() => {
        const defaults = {
            todo: 'Abrir',
            'in-progress': 'À vista',
            testing: 'Entrada',
            review: 'Parcelado',
            done: 'Concluído'
        };
        try {
            const saved = localStorage.getItem('kanban_column_labels');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed['in-progress'] === 'Em Andamento') return defaults;
                return parsed;
            }
        } catch (e) {
            console.error("Erro ao ler kanban_column_labels:", e);
        }
        return defaults;
    });

    useEffect(() => {
        localStorage.setItem('kanban_column_labels', JSON.stringify(columnLabels));
    }, [columnLabels]);

    const [editingColId, setEditingColId] = useState<string | null>(null);

    const getRefName = (type?: string, id?: string) => {
        if (!id || !type) return null;
        if (type === 'DEBT') {
            const debt = debts.find(d => String(d.id) === String(id));
            return debt ? debt.banco : 'Dívida';
        } else {
            const obj = objectives.find(o => String(o.id) === String(id));
            return obj ? obj.name : 'Objetivo';
        }
    };

    const parseTaskDate = (dateStr: any) => {
        if (!dateStr || typeof dateStr !== 'string') return new Date(NaN);
        try {
            if (dateStr.length === 10) return new Date(dateStr + 'T12:00:00');
            return new Date(dateStr);
        } catch (e) {
            return new Date(NaN);
        }
    };

    const today = new Date();
    today.setHours(0,0,0,0);

    const validTasks = tasks.filter(t => !isNaN(parseTaskDate(t.date).getTime()));
    const tasksWithoutDate = tasks.filter(t => isNaN(parseTaskDate(t.date).getTime()));
    const sortedTasks = [...validTasks].sort((a, b) => parseTaskDate(a.date).getTime() - parseTaskDate(b.date).getTime());

    const groupedByMonth = sortedTasks.reduce((acc, task) => {
        const dateObj = parseTaskDate(task.date);
        if (isNaN(dateObj.getTime())) return acc;

        const monthYear = dateObj.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        const dateKey = dateObj.toISOString().split('T')[0];

        if (!acc[monthYear]) acc[monthYear] = {};
        if (!acc[monthYear][dateKey]) acc[monthYear][dateKey] = [];
        acc[monthYear][dateKey].push(task);
        return acc;
    }, {} as Record<string, Record<string, Task[]>>);

    const columns: { id: Task['status'], label: string, icon: string, color: string }[] = [
        { id: 'todo', label: columnLabels.todo, icon: '⭕', color: '#e74c3c' },
        { id: 'in-progress', label: columnLabels['in-progress'], icon: '📥', color: '#3498db' },
        { id: 'testing', label: columnLabels.testing, icon: '⚡', color: '#9b59b6' },
        { id: 'review', label: columnLabels.review, icon: '📦', color: '#f1c40f' },
        { id: 'done', label: columnLabels.done, icon: '✅', color: '#2ecc71' }
    ];

    const handleDragStart = (e: React.DragEvent, id: string) => {
        setDraggedTaskId(id);
        e.dataTransfer.setData('taskId', id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDragEnter = (e: React.DragEvent, id: string) => {
        e.preventDefault();
        setDragOverColId(id);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOverColId(null);
    };

    const handleDrop = async (e: React.DragEvent, status: Task['status']) => {
        e.preventDefault();
        setDragOverColId(null);
        const id = e.dataTransfer.getData('taskId') || draggedTaskId;
        if (!id) return;

        const task = tasks.find(t => String(t.id) === String(id));
        if (task && task.status !== status) {
            handleStatusChange(task, status);
        }
        setDraggedTaskId(null);
    };

    const handleRenameColumn = (id: string, newLabel: string) => {
        setColumnLabels(prev => ({ ...prev, [id]: newLabel }));
        setEditingColId(null);
    };

    const tasksByStatus = tasks.reduce((acc, task) => {
        const status = task.status || 'todo';
        if (!acc[status]) acc[status] = [];
        acc[status].push(task);
        return acc;
    }, {} as Record<string, Task[]>);

    const handleSaveTask = async (taskData: Omit<Task, 'id'>) => {
        const finalTitle = taskData.title?.trim() || 'Tarefa Sem Título';
        const finalData = { ...taskData, title: finalTitle };

        if (selectedTask && 'id' in selectedTask && selectedTask.id) {
            const updated = { ...finalData, id: selectedTask.id } as Task;
            await api.updateTask(updated);
            setTasks(prev => prev.map(t => String(t.id) === String(selectedTask.id) ? updated : t));
        } else {
            const newTask = await api.addTask({ ...finalData, completed: finalData.status === 'done' });
            setTasks(prev => [...prev, newTask]);
        }
    };

    const handleStatusChange = async (task: Task, newStatus: Task['status']) => {
        const updated = { ...task, status: newStatus, completed: newStatus === 'done' };
        await api.updateTask(updated);
        setTasks(prev => prev.map(t => String(t.id) === String(task.id) ? updated : t));
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Excluir esta tarefa?")) {
            await api.deleteTask(id);
            setTasks(prev => prev.filter(t => t.id !== id));
        }
    };

    const openNewTask = (status: Task['status'] = 'todo') => {
        setSelectedTask({ status });
        setIsModalOpen(true);
    };

    const openEditTask = (task: Task) => {
        setSelectedTask(task);
        setIsModalOpen(true);
    };

    const getPriorityColor = (p: Task['priority']) => {
        switch(p) {
            case 'urgent': return '#e74c3c';
            case 'high': return '#e67e22';
            case 'low': return '#95a5a6';
            default: return '#f1c40f';
        }
    };

    const getPriorityLabel = (p: Task['priority']) => {
        switch(p) {
            case 'urgent': return 'Urgente';
            case 'high': return 'Alta';
            case 'low': return 'Baixa';
            default: return 'Normal';
        }
    };

    return (
        <div className="tasks-view fade-in">
            <div className="tasks-header">
                <div className="header-left">
                    <h2>📋 Gerenciador de Tarefas</h2>
                    <div className="view-toggle">
                        <button className={viewMode === 'kanban' ? 'active' : ''} onClick={() => setViewMode('kanban')}>Modo Mural</button>
                        <button className={viewMode === 'timeline' ? 'active' : ''} onClick={() => setViewMode('timeline')}>Modo Agenda</button>
                    </div>
                </div>
                <button className="add-task-header-btn" onClick={() => openNewTask()}>+ Nova Tarefa</button>
            </div>

            {viewMode === 'timeline' ? (
                <div className="tasks-agenda-view">
                    {Object.keys(groupedByMonth).length === 0 ? (
                        <div className="empty-tasks">Nenhuma tarefa agendada.</div>
                    ) : (
                        Object.entries(groupedByMonth).map(([monthYear, days]) => (
                            <div key={monthYear} className="agenda-month-group">
                                <h3 className="agenda-month-title">{monthYear}</h3>
                                {Object.entries(days).map(([dateKey, dayTasks]) => {
                                    const dateObj = parseTaskDate(dateKey);
                                    const isToday = today.toDateString() === dateObj.toDateString();
                                    const isPast = today > dateObj && !isToday;

                                    return (
                                        <div key={dateKey} className={`agenda-day-block ${isToday ? 'is-today' : ''} ${isPast ? 'is-past' : ''}`}>
                                            <div className="agenda-date-sidebar">
                                                <span className="agenda-day-num">{dateObj.getDate()}</span>
                                                <span className="agenda-day-name">{dateObj.toLocaleDateString('pt-BR', { weekday: 'short' })}</span>
                                                {isToday && <span className="today-label">HOJE</span>}
                                            </div>
                                            <div className="agenda-tasks-list">
                                                {dayTasks.map(task => (
                                                    <div key={task.id} className={`agenda-task-card glass ${task.status}`} onClick={() => openEditTask(task)}>
                                                        <div className="agenda-task-top">
                                                            <div className="agenda-task-info">
                                                                <h4 className="agenda-task-title">{(task as any).error ? 'Tarefa Sem Título' : (task.title || 'Sem Título')}</h4>
                                                                {task.referenceType && (
                                                                    <div className="agenda-task-ref">
                                                                        {task.referenceType === 'DEBT' ? '💳 Conta:' : '🎯 Meta:'} <strong>{getRefName(task.referenceType, task.referenceId)}</strong>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="agenda-task-actions">
                                                                <span className="agenda-prio" style={{color: getPriorityColor(task.priority)}}>🚩 {getPriorityLabel(task.priority)}</span>
                                                                <button className="agenda-delete" onClick={(e) => { e.stopPropagation(); handleDelete(task.id); }}>🗑️</button>
                                                            </div>
                                                        </div>
                                                        {task.description && (
                                                            <div className="agenda-task-desc">
                                                                <p>{task.description}</p>
                                                            </div>
                                                        )}
                                                        <div className="agenda-task-footer">
                                                            <span className={`status-badge ${task.status}`}>{columnLabels[task.status] || task.status}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))
                    )}

                    {tasksWithoutDate.length > 0 && (
                        <div className="agenda-month-group undated-tasks">
                            <h3 className="agenda-month-title">📅 Tarefas sem Data Definida</h3>
                            <div className="agenda-day-block">
                                <div className="agenda-date-sidebar">
                                    <span className="agenda-day-num">?</span>
                                    <span className="agenda-day-name">S/D</span>
                                </div>
                                <div className="agenda-tasks-list">
                                    {tasksWithoutDate.map(task => (
                                        <div key={task.id} className={`agenda-task-card glass ${task.status}`} onClick={() => openEditTask(task)}>
                                            <div className="agenda-task-top">
                                                <div className="agenda-task-info">
                                                    <h4 className="agenda-task-title">{(task as any).error ? 'Tarefa Sem Título' : (task.title || 'Sem Título')}</h4>
                                                    {task.referenceType && (
                                                        <div className="agenda-task-ref">
                                                            {task.referenceType === 'DEBT' ? '💳 Conta:' : '🎯 Meta:'} <strong>{getRefName(task.referenceType, task.referenceId)}</strong>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="agenda-task-actions">
                                                    <span className="agenda-prio" style={{color: getPriorityColor(task.priority)}}>🚩 {getPriorityLabel(task.priority)}</span>
                                                    <button className="agenda-delete" onClick={(e) => { e.stopPropagation(); handleDelete(task.id); }}>🗑️</button>
                                                </div>
                                            </div>
                                            {task.description && (
                                                <div className="agenda-task-desc">
                                                    <p>{task.description}</p>
                                                </div>
                                            )}
                                            <div className="agenda-task-footer">
                                                <span className={`status-badge ${task.status}`}>{columnLabels[task.status] || task.status}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="kanban-board">
                    {columns.map(col => (
                        <div 
                            key={col.id} 
                            className={`kanban-column ${dragOverColId === col.id ? 'is-drag-over' : ''}`}
                            onDragOver={handleDragOver}
                            onDragEnter={(e) => handleDragEnter(e, col.id)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, col.id)}
                        >
                            <div className="kanban-column-header">
                                <span className="col-icon" style={{background: col.color}}>{col.icon}</span>
                                {editingColId === col.id ? (
                                    <input 
                                        type="text" 
                                        className="col-rename-input"
                                        defaultValue={col.label} 
                                        onBlur={(e) => handleRenameColumn(col.id, e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleRenameColumn(col.id, (e.target as HTMLInputElement).value)}
                                        autoFocus
                                    />
                                ) : (
                                    <h3 onClick={() => setEditingColId(col.id)} title="Clique para renomear">{col.label}</h3>
                                )}
                                <span className="col-count">{(tasksByStatus[col.id] || []).length}</span>
                                <button className="add-in-col" onClick={() => openNewTask(col.id)}>+</button>
                            </div>
                            <div className="kanban-cards">
                                {(tasksByStatus[col.id] || []).map(task => {
                                    const dateObj = parseTaskDate(task.date);
                                    const isValidDate = !isNaN(dateObj.getTime());
                                    const isToday = today.toDateString() === dateObj.toDateString();
                                    const isPast = isValidDate && today > dateObj && !isToday && task.status !== 'done';
                                    const isFuture = isValidDate && today < dateObj && task.status !== 'done';

                                    let dateClass = '';
                                    if (isPast) dateClass = 'card-late';
                                    else if (isToday) dateClass = 'card-today';
                                    else if (isFuture) dateClass = 'card-future';

                                    return (
                                        <div 
                                            key={task.id} 
                                            className={`kanban-card glass ${dateClass} ${draggedTaskId === task.id ? 'is-dragging' : ''}`} 
                                            onClick={() => openEditTask(task)}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, task.id)}
                                        >
                                            <div className="card-top">
                                                <div className="user-icon">👤</div>
                                                <div className="card-status-fast">
                                                    {columns.map(c => (
                                                        <button 
                                                            key={c.id} 
                                                            className={`status-dot-btn ${task.status === c.id ? 'active' : ''}`}
                                                            style={{background: task.status === c.id ? c.color : 'rgba(255,255,255,0.1)'}}
                                                            onClick={(e) => { e.stopPropagation(); handleStatusChange(task, c.id); }}
                                                            title={`Mover para: ${c.label}`}
                                                        />
                                                    ))}
                                                </div>
                                                <button className="card-delete-trash" onClick={(e) => { e.stopPropagation(); handleDelete(task.id); }}>🗑️</button>
                                            </div>
                                            <h4 className="card-title">{(task as any).error ? 'Tarefa Sem Título' : (task.title || 'Sem Título')}</h4>
                                            {task.description && <p className="card-desc-short">{task.description}</p>}
                                            <div className="card-footer">
                                                <div className={`card-date ${isPast ? 'text-late' : ''}`}>
                                                    📅 {isValidDate ? dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : 'Data Indefinida'}
                                                </div>
                                                <div className="card-priority" style={{color: getPriorityColor(task.priority)}}>
                                                    🚩 {getPriorityLabel(task.priority)}
                                                </div>
                                            </div>
                                            {task.referenceType && (
                                                <div className="card-ref-badge">
                                                    {task.referenceType === 'DEBT' ? '💳' : '🎯'} {getRefName(task.referenceType, task.referenceId)}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <TaskModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSave={handleSaveTask} 
                initialData={selectedTask}
                objectives={objectives}
                debts={debts}
            />
        </div>
    );
};

export default TasksView;
