import React from 'react';
import { Objective } from './Objectives';
import './ReportView.css';
interface ReportViewProps {
    accumulatedBRL: number;
    objectives: Objective[];
    targetBRL: number;
}
const ReportView: React.FC<ReportViewProps> = ({ accumulatedBRL, objectives, targetBRL }) => {
    const totalAllocated = objectives.reduce((sum, obj) => sum + (Number(obj.accumulatedBRL) || 0), 0);
    const safeTargetBRL = Number(targetBRL) || 0;
    const unallocated = (Number(accumulatedBRL) || 0) - totalAllocated;
    const surplus = (Number(accumulatedBRL) || 0) - safeTargetBRL;
    const data = [
        ...objectives.map(obj => ({
            name: obj.name || '-',
            value: Number(obj.accumulatedBRL) || 0,
            target: Number(obj.targetBRL) || 0,
            icon: obj.icon || '📌',
            color: '#43e97b',
            completed: !!obj.completed
        })),
        {
            name: 'Saldo Geral (Não Alocado)',
            value: unallocated > 0 ? unallocated : 0,
            target: 0,
            icon: '💼',
            color: '#38f9d7',
            completed: false
        }
    ].sort((a, b) => {
        if (b.value !== a.value) return b.value - a.value;
        return b.target - a.target; 
    });
    return (
        <div className="report-view glass">
            <h2 className="report-title">Relatório de Aporte</h2>
            <div className="report-header-summary">
                <div className="summary-item">
                    <span className="summary-label">Meta Total</span>
                    <span className="summary-value">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(targetBRL)}
                    </span>
                </div>
                <div className="summary-divider"></div>
                <div className="summary-item">
                    <span className="summary-label">Total Acumulado</span>
                    <span className="summary-value highlight-white">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(accumulatedBRL)}
                    </span>
                </div>
                <div className="summary-divider"></div>
                <div className="summary-item">
                    <span className="summary-label">Excedente / Emergência</span>
                    <span className={`summary-value ${surplus > 0 ? 'highlight-blue' : ''}`} style={{ color: surplus > 0 ? '#38f9d7' : 'rgba(255,255,255,0.3)' }}>
                        {surplus > 0
                            ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(surplus)
                            : 'R$ 0,00'}
                    </span>
                </div>
            </div>
            <div className="report-table-container">
                <table className="report-table">
                    <thead>
                        <tr>
                            <th>Objetivo</th>
                            <th className="text-right">Meta</th>
                            <th className="text-right">Em Andamento</th>
                            <th className="text-center">% da Meta Total</th>
                            <th>Progresso na Meta</th>
                            <th className="text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, index) => {
                            const safeTarget = safeTargetBRL > 0 ? safeTargetBRL : 1;
                            const percentageOfTarget = (item.value / safeTarget) * 100;
                            if (item.value <= 0 && item.target <= 0) return null;
                            return (
                                <tr key={index}>
                                    <td className="objective-cell">
                                        <span className="cell-icon">{item.icon}</span>
                                        <span className="cell-name">{item.name}</span>
                                    </td>
                                    <td className="text-right font-mono">
                                        {item.target > 0
                                            ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.target)
                                            : '-'}
                                    </td>
                                    <td className="text-right font-mono">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.value)}
                                    </td>
                                    <td className="text-center font-bold">
                                        {percentageOfTarget.toFixed(2)}%
                                    </td>
                                    <td className="progress-cell">
                                        <div className="table-progress-bar">
                                            <div
                                                className="table-progress-fill"
                                                style={{ width: `${Math.min(percentageOfTarget, 100)}%`, backgroundColor: item.color }}
                                            ></div>
                                        </div>
                                    </td>
                                    <td className="text-center">
                                        <span className={`status-badge-table ${item.completed ? 'completed' : 'pending'}`}>
                                            {item.completed ? 'Concluído' : 'Pendente'}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot>
                        <tr className="total-row">
                            <td className="objective-cell">
                                <span className="cell-name">TOTAL</span>
                            </td>
                            <td className="text-right font-mono highlight-total">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(targetBRL)}
                            </td>
                            <td className="text-right font-mono highlight-total">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalAllocated)}
                            </td>
                            <td className="text-center font-bold">
                                {(((Number(totalAllocated) || 0) / (safeTargetBRL > 0 ? safeTargetBRL : 1)) * 100).toFixed(2)}%
                            </td>
                            <td></td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};
export default ReportView;
