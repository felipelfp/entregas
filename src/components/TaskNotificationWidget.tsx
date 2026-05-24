import React, { useEffect } from 'react';
import { Task } from './TaskModal';
import './TaskNotificationWidget.css';

interface TaskNotificationWidgetProps {
    tasks: Task[];
    onOpenTasks: () => void;
    onToggleComplete: (id: string) => void;
}

const TaskNotificationWidget: React.FC<TaskNotificationWidgetProps> = ({ tasks, onOpenTasks }) => {
    const todayDate = new Date().toDateString();
    const pendingTasks = tasks.filter(t => !t.completed);

    const urgentTasks = pendingTasks.filter(t => {
        if (!t.date) return false;
        const taskDateObj = new Date(t.date + 'T12:00:00');
        if (isNaN(taskDateObj.getTime())) return false;
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
            let notifiedIds: string[] = [];
            try {
                const stored = localStorage.getItem('notified_tasks');
                const parsed = stored ? JSON.parse(stored) : [];
                if (Array.isArray(parsed)) notifiedIds = parsed;
            } catch (e) {
                console.error("Erro ao ler notified_tasks:", e);
            }
            const tasksToNotify = urgentTasks.filter(t => !notifiedIds.includes(t.id));

            if (tasksToNotify.length > 0) {
                tasksToNotify.forEach(task => {
                    const todayObjNotify = new Date(todayDate);
                    const taskDateObjNotify = new Date(task.date + 'T12:00:00');
                    if (!isNaN(taskDateObjNotify.getTime())) {
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
                    }
                    notifiedIds.push(task.id);
                });

                try {
                    localStorage.setItem('notified_tasks', JSON.stringify(notifiedIds));
                } catch {}
            }
        }
    }, [urgentTasks, onOpenTasks, todayDate, hasUrgent]);

    return (
        <div className="task-notification-container">
            <div 
                className={`task-bell-wrapper ${hasUrgent ? 'pulse-alert' : ''}`}
                onClick={(e) => {
                    e.stopPropagation();
                    onOpenTasks(); // Directly navigate to the beautiful Notifications page!
                }}
                title={`Avisos e Lembretes (${urgentTasks.length} urgentes)`}
            >
                <div className="task-bell-icon">🔔</div>
                {hasUrgent && (
                    <div className="task-badge">{urgentTasks.length}</div>
                )}
            </div>
        </div>
    );
};

export default TaskNotificationWidget;
