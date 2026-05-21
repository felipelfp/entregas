import React, { useState, useEffect } from 'react';
import './TaskModal.css';

export interface Task {
    id: string;
    title: string;
    date: string; 
    description?: string;
    completed: boolean;
    status: 'todo' | 'in-progress' | 'testing' | 'review' | 'done';
    priority: 'low' | 'normal' | 'high' | 'urgent';
    referenceId?: string; 
    referenceType?: 'DEBT' | 'OBJECTIVE';
}

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (task: Omit<Task, 'id'>) => void;
    initialData?: Partial<Task>;
    objectives?: any[];
    debts?: any[];
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSave, initialData, objectives = [], debts = [] }) => {
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState<Task['status']>('todo');
    const [priority, setPriority] = useState<Task['priority']>('normal');
    const [refType, setRefType] = useState<'DEBT' | 'OBJECTIVE' | ''>('');
    const [refId, setRefId] = useState('');

    useEffect(() => {
        if (isOpen) {

            setTitle(initialData?.title || '');
            setDate(initialData?.date || new Date().toISOString().split('T')[0]);
            setDescription(initialData?.description || '');
            setStatus(initialData?.status || 'todo');
            setPriority(initialData?.priority || 'normal');
            setRefType(initialData?.referenceType || '');
            setRefId(initialData?.referenceId || '');
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ 
            title, 
            date, 
            description,
            status,
            priority,
            completed: status === 'done',
            referenceId: refId || undefined,
            referenceType: (refType as any) || undefined
        });
        onClose();
    };

    return (
        <div className="task-modal-overlay" onClick={onClose}>
            <div className="task-modal-content glass" onClick={e => e.stopPropagation()}>
                <button className="task-modal-close" onClick={onClose}>&times;</button>
                <h2>{initialData?.id ? 'Editar Tarefa' : 'Nova Tarefa'}</h2>

                <form onSubmit={handleSubmit} className="task-form">
                    {initialData?.id && description && (
                        <div className="task-info-highlight">
                            <label>📌 O QUE FAZER:</label>
                            <div className="task-description-view">{description}</div>
                        </div>
                    )}

                    <div className="form-group">
                        <label>Título da Tarefa</label>
                        <input 
                            type="text" 
                            value={title} 
                            onChange={e => setTitle(e.target.value)} 
                            placeholder="Ex: Pagar Fatura Havan"
                            required 
                            autoFocus
                        />
                    </div>

                    <div className="form-group-row">
                        <div className="form-group">
                            <label>Data</label>
                            <input 
                                type="date" 
                                value={date} 
                                onChange={e => setDate(e.target.value)} 
                                required 
                            />
                        </div>

                        <div className="form-group">
                            <label>Associar a...</label>
                            <select value={refType} onChange={e => {
                                setRefType(e.target.value as any);
                                setRefId('');
                            }}>
                                <option value="">Nada (Tarefa Avulsa)</option>
                                <option value="OBJECTIVE">🎯 Objetivo</option>
                                <option value="DEBT">💳 Conta/Dívida</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group-row">
                        <div className="form-group">
                            <label>Status</label>
                            <select value={status} onChange={e => setStatus(e.target.value as any)}>
                                <option value="todo">Abrir</option>
                                <option value="in-progress">Em Andamento</option>
                                <option value="testing">Testando</option>
                                <option value="review">Revisão</option>
                                <option value="done">Concluído</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Prioridade</label>
                            <select value={priority} onChange={e => setPriority(e.target.value as any)}>
                                <option value="low">Baixa</option>
                                <option value="normal">Normal</option>
                                <option value="high">Alta</option>
                                <option value="urgent">Urgente</option>
                            </select>
                        </div>
                    </div>

                    {refType === 'OBJECTIVE' && (
                        <div className="form-group">
                            <label>Selecione o Objetivo</label>
                            <select value={refId} onChange={e => setRefId(e.target.value)} required>
                                <option value="">-- Selecione --</option>
                                {objectives.map(obj => (
                                    <option key={obj.id} value={obj.id}>{obj.icon} {obj.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {refType === 'DEBT' && (
                        <div className="form-group">
                            <label>Selecione a Conta</label>
                            <select value={refId} onChange={e => setRefId(e.target.value)} required>
                                <option value="">-- Selecione --</option>
                                {debts.map(debt => (
                                    <option key={debt.id} value={debt.id}>{debt.banco} ({debt.titular})</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="form-group">
                        <label>Anotações (Opcional)</label>
                        <textarea 
                            value={description} 
                            onChange={e => setDescription(e.target.value)} 
                            placeholder="Detalhes ou valores..."
                            rows={3}
                        />
                    </div>

                    <button type="submit" className="save-task-btn">Salvar Tarefa</button>
                </form>
            </div>
        </div>
    );
};

export default TaskModal;
