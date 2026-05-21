import React from 'react';
import DepositForm, { Deposit } from './DepositForm';
import Statement from './Statement';
import './DashboardView.css';

import { Objective } from './Objectives';

interface DashboardViewProps {
    exchangeRate: number;
    transactions: Deposit[];
    onDeposit: (deposit: Deposit, objectiveId?: string) => void;
    accumulatedBRL: number;
    totalTargetBRL: number;
    totalTargetUSD: number;
    totalObjectivesBRL: number;
    totalDebtsOriginalBRL: number;
    totalDebtsPropostaBRL: number;
    objectives: Objective[];
    debts: any[];
    onDelete: (id: number) => void;
    dailyDeliveryTarget?: number;
    progressBRL?: number;
    progressPercent?: number;
}

const DashboardView: React.FC<DashboardViewProps> = ({
    exchangeRate,
    transactions,
    onDeposit,
    accumulatedBRL,
    totalTargetBRL,
    totalTargetUSD,
    totalObjectivesBRL,
    totalDebtsOriginalBRL,
    totalDebtsPropostaBRL,
    objectives,
    debts,
    onDelete,
    dailyDeliveryTarget,
    progressBRL,
    progressPercent
}) => {

    const targetBRL = typeof totalTargetBRL === 'number' && !isNaN(totalTargetBRL) ? totalTargetBRL : 0;
    const targetUSD = typeof totalTargetUSD === 'number' && !isNaN(totalTargetUSD) ? totalTargetUSD : 0;
    const totalMonths = 100; 
    const totalDays = 3000;  

    const monthlyGoalBRL = targetBRL > 0 ? (targetBRL / totalMonths) : 0;
    const dailyGoalBRL = targetBRL > 0 ? (targetBRL / totalDays) : 0;

    const monthlyGoalUSD = targetUSD > 0 ? (targetUSD / totalMonths) : 0;
    const dailyGoalUSD = targetUSD > 0 ? (targetUSD / totalDays) : 0;

    const progressBRLValue = progressBRL !== undefined ? progressBRL : accumulatedBRL;
    const progress = progressPercent !== undefined ? progressPercent : (targetBRL > 0 ? (progressBRLValue / targetBRL) * 100 : 0);

    const formatBRL = (val: number) => {
        try {
            const num = typeof val === 'number' && !isNaN(val) && isFinite(val) ? val : 0;
            return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
        } catch {
            return `R$ ${(val || 0).toFixed(2)}`;
        }
    };

    const formatUSD = (val: number) => {
        try {
            const num = typeof val === 'number' && !isNaN(val) && isFinite(val) ? val : 0;
            return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
        } catch {
            return `$ ${(val || 0).toFixed(2)}`;
        }
    };

    const displayedDailyGoalBRL = dailyDeliveryTarget !== undefined ? dailyDeliveryTarget : dailyGoalBRL;
    const displayedDailyGoalUSD = dailyDeliveryTarget !== undefined ? (dailyDeliveryTarget / exchangeRate) : dailyGoalUSD;

    return (
        <div className="dashboard-view">
            <h2 className="section-title">Visão Geral</h2>

            <div className="dashboard-stats-grid">
                <div className="stat-card glass highlight-card">
                    <span className="stat-icon">🎯</span>
                    <div className="stat-content">
                        <span className="stat-label">Meta Total (Metas + Dívidas)</span>
                        <span className="stat-value">{formatBRL(targetBRL)}</span>
                        <span className="stat-sub-value" style={{color: '#3498db', fontWeight: 'bold'}}>USD {formatUSD(targetUSD)}</span>
                    </div>
                </div>

                <div className="stat-card glass">
                    <span className="stat-icon">📅</span>
                    <div className="stat-content">
                        <span className="stat-label">Meta Mensal Consolidada</span>
                        <span className="stat-value">{formatBRL(monthlyGoalBRL)}</span>
                        <span className="stat-sub-value" style={{color: '#3498db'}}>USD {formatUSD(monthlyGoalUSD)}</span>
                    </div>
                </div>

                <div className="stat-card glass">
                    <span className="stat-icon">📆</span>
                    <div className="stat-content">
                        <span className="stat-label">Meta Diária (Entregas)</span>
                        <span className="stat-value">{formatBRL(displayedDailyGoalBRL)}</span>
                        <span className="stat-sub-value" style={{color: '#3498db'}}>USD {formatUSD(displayedDailyGoalUSD)}</span>
                    </div>
                </div>

                <div className="stat-card glass">
                    <span className="stat-icon">💰</span>
                    <div className="stat-content">
                        <span className="stat-label">Acumulado</span>
                        <span className="stat-value highlight">
                            {formatBRL(accumulatedBRL)}
                        </span>
                    </div>
                </div>

                <div className="stat-card glass">
                    <span className="stat-icon">🤝</span>
                    <div className="stat-content">
                        <span className="stat-label">Saldo p/ Quitação</span>
                        <span className="stat-value" style={{color: '#f59e0b'}}>
                            {formatBRL(totalDebtsPropostaBRL)}
                        </span>
                        <span className="stat-sub-value" style={{color: '#10b981'}}>
                            Economia: {formatBRL(totalDebtsOriginalBRL - totalDebtsPropostaBRL)}
                        </span>
                    </div>
                </div>

                <div className="stat-card glass">
                    <span className="stat-icon">📊</span>
                    <div className="stat-content">
                        <span className="stat-label">Progresso Geral</span>
                        <span className="stat-value">{Math.max(0, typeof progress === 'number' && !isNaN(progress) ? progress : 0).toFixed(2)}%</span>
                        <div className="mini-progress-bar">
                            <div className="mini-progress-fill" style={{ width: `${Math.max(0, Math.min(typeof progress === 'number' && !isNaN(progress) ? progress : 0, 100))}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="dashboard-actions-area">
                <div className="action-section">
                    <DepositForm exchangeRate={exchangeRate} onDeposit={onDeposit} objectives={objectives} />
                </div>
                <div className="statement-section">
                    <Statement transactions={transactions} onDelete={onDelete} />
                </div>
            </div>
        </div>
    );
};

export default DashboardView;
