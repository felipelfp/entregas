import React, { useState, useEffect } from 'react';
import { Task } from './TaskModal';
import './TaskNotificationWidget.css';

interface TaskNotificationWidgetProps {
    tasks: Task[];
    onOpenTasks: () => void;
}

const TaskNotificationWidget: React.FC<TaskNotificationWidgetProps> = ({ tasks, onOpenTasks }) => {
    const [isOpen, setIsOpen] = useState(false);

    const todayDate = new Date().toDateString();

    const pendingTasks = tasks.filter(t => !t.completed);

    const urgentTasks = pendingTasks.filter(t => {
        const taskDateObj = new Date(t.date + 'T12:00:00');
        const todayObj = new Date(todayDate);
        return taskDateObj <= todayObj;
    });

    const hasUrgent = urgentTasks.length > 0;

    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    useEffect(() => {
        if (!hasUrgent) return;

        if ('Notification' in window && Notification.permission === 'granted') {
            const notifiedIds: string[] = JSON.parse(localStorage.getItem('notified_tasks') || '[]');
            const tasksToNotify = urgentTasks.filter(t => !notifiedIds.includes(t.id));

            if (tasksToNotify.length > 0) {
                tasksToNotify.forEach(task => {
                    const todayObjNotify = new Date(todayDate);
                    const taskDateObjNotify = new Date(task.date + 'T12:00:00');
                    const isLate = taskDateObjNotify < todayObjNotify;
                    const daysLate = isLate ? Math.floor((todayObjNotify.getTime() - taskDateObjNotify.getTime()) / (1000 * 3600 * 24)) : 0;
                    const titleStr = isLate ? `⚠️ Tarefa Atrasada (${daysLate} dias)!` : '🔔 Tarefa para Hoje!';
                    const notification = new Notification(titleStr, {
                        body: task.title,
                        icon: '/vite.svg'
                    });

                    notification.onclick = () => {
                        window.focus();
                        onOpenTasks();
                        notification.close();
                    };

                    notifiedIds.push(task.id);
                });

                localStorage.setItem('notified_tasks', JSON.stringify(notifiedIds));
            }
        }
    }, [urgentTasks, onOpenTasks, todayDate]);

    useEffect(() => {
        const handleClickOutside = () => setIsOpen(false);
        if (isOpen) {
            window.addEventListener('click', handleClickOutside);
        }
        return () => window.removeEventListener('click', handleClickOutside);
    }, [isOpen]);

    return (
        <div className="task-notification-container">
            <div 
                className={`task-bell-wrapper ${hasUrgent ? 'pulse-alert' : ''}`}
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
            >
                <div className="task-bell-icon">🔔</div>
                {hasUrgent && (
                    <div className="task-badge">{urgentTasks.length}</div>
                )}
            </div>

            {isOpen && (
                <div className="task-dropdown glass" onClick={(e) => e.stopPropagation()}>
                    <div className="dropdown-header">
                        <h4>Avisos & Lembretes</h4>
                        <span className="pending-count">{pendingTasks.length} pendentes</span>
                    </div>

                    <div className="dropdown-body">
                        {urgentTasks.length === 0 ? (
                            <div className="no-urgent-tasks">Tudo em dia para hoje! ✅</div>
                        ) : (
                            urgentTasks.map(task => {
                                const taskDateObj = new Date(task.date + 'T12:00:00');
                                const isLate = taskDateObj < new Date(todayDate);
                                const daysLate = isLate ? Math.floor((new Date(todayDate).getTime() - taskDateObj.getTime()) / (1000 * 3600 * 24)) : 0;

                                return (
                                    <div key={task.id} className="dropdown-task-item" onClick={onOpenTasks}>
                                        <div className={`task-status-dot ${isLate ? 'late' : 'today'}`}></div>
                                        <div className="dropdown-task-info">
                                            <span className="dropdown-task-title">{task.title}</span>
                                            <span className="dropdown-task-date">
                                                {isLate ? `Atrasada ${daysLate} dia${daysLate > 1 ? 's' : ''}` : 'Hoje'}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <div className="dropdown-footer" onClick={onOpenTasks}>
                        Ver Calendário Completo
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskNotificationWidget;
