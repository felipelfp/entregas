import React, { useEffect, useState } from 'react';
import Clock from './components/Clock';
import JourneyInfo from './components/JourneyInfo';
import ReportView from './components/ReportView';
import Objectives, { initialObjectives, Objective } from './components/Objectives';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import LoginView from './components/LoginView';
import PremiumDashboard from './components/PremiumDashboard';
import TasksView from './components/TasksView';
import FinancialOverview from './components/FinancialOverview';
import DeliveryTracker from './components/DeliveryTracker';
import TaskNotificationWidget from './components/TaskNotificationWidget';
import TaskModal, { Task } from './components/TaskModal';
import { Deposit } from './components/DepositForm';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import './App.css';

import { api } from './services/api';

export const initialDebts = [
    { id: 1, titular: "Casa", banco: "IPTU", valor: 50.00, tipo: "avista", vlrP: 50.00, qtd: 1, status: "pendente" },
    { id: 2, titular: "Casa", banco: "Celular", valor: 99.00, tipo: "avista", vlrP: 99.00, qtd: 1, status: "pendente" },
    { id: 3, titular: "Felipe", banco: "TIM", valor: 110.13, tipo: "avista", vlrP: 44.05, qtd: 1, status: "pendente" },
    { id: 4, titular: "Casa", banco: "Internet", valor: 130.00, tipo: "avista", vlrP: 130.00, qtd: 1, status: "pendente" },
    { id: 5, titular: "Felipe", banco: "ShopeePay", valor: 138.74, tipo: "avista", vlrP: 55.25, qtd: 1, status: "pendente" },
    { id: 6, titular: "Fernanda", banco: "ShopeePay", valor: 139.88, tipo: "avista", vlrP: 69.93, qtd: 1, status: "pendente" },
    { id: 7, titular: "Felipe", banco: "Vivo", valor: 145.84, tipo: "avista", vlrP: 138.54, qtd: 1, status: "pendente" },
    { id: 8, titular: "Casa", banco: "Luz", valor: 150.00, tipo: "avista", vlrP: 150.00, qtd: 1, status: "pendente" },
    { id: 9, titular: "Casa", banco: "Condominio", valor: 350.00, tipo: "avista", vlrP: 350.00, qtd: 1, status: "pendente" },
    { id: 10, titular: "Felipe", banco: "Santander", valor: 545.87, tipo: "avista", vlrP: 85.33, qtd: 1, status: "pendente" },
    { id: 11, titular: "Felipe", banco: "Nubank", valor: 700.48, tipo: "avista", vlrP: 218.80, qtd: 1, status: "pendente" },
    { id: 12, titular: "Felipe", banco: "Senff", valor: 999.88, tipo: "avista", vlrP: 712.54, qtd: 1, status: "pendente" },
    { id: 13, titular: "Felipe", banco: "Pefisa (ARC4)", valor: 1247.29, tipo: "avista", vlrP: 296.89, qtd: 1, status: "pendente" },
    { id: 14, titular: "Felipe", banco: "Claro", valor: 1250.94, tipo: "avista", vlrP: 493.87, qtd: 1, status: "pendente" },
    { id: 15, titular: "Fernanda", banco: "Simplic", valor: 1301.73, tipo: "avista", vlrP: 310.41, qtd: 1, status: "pendente" },
    { id: 16, titular: "Felipe", banco: "Casas Bahia (Rec)", valor: 1348.11, tipo: "avista", vlrP: 1241.04, qtd: 1, status: "pendente" },
    { id: 17, titular: "Casa", banco: "Aluguel", valor: 1350.00, tipo: "avista", vlrP: 1350.00, qtd: 1, status: "pendente" },
    { id: 18, titular: "Fernanda", banco: "Havan", valor: 1393.84, tipo: "avista", vlrP: 1064.29, qtd: 1, status: "pendente" },
    { id: 19, titular: "Felipe", banco: "Renner", valor: 1842.31, tipo: "avista", vlrP: 712.76, qtd: 1, status: "pendente" },
    { id: 20, titular: "Felipe", banco: "Magalu (Recovery)", valor: 1729.88, tipo: "avista", vlrP: 411.35, qtd: 1, status: "pendente" },
    { id: 21, titular: "Felipe", banco: "B. Brasil (Ativos)", valor: 2002.50, tipo: "parcelado", vlrP: 300.00, qtd: 7, status: "pendente" },
    { id: 22, titular: "Fernanda", banco: "Nubank", valor: 2807.18, tipo: "avista", vlrP: 1473.86, qtd: 1, status: "pendente" },
    { id: 23, titular: "Felipe", banco: "Neon", valor: 3103.18, tipo: "avista", vlrP: 471.37, qtd: 1, status: "pendente" },
    { id: 24, titular: "Felipe", banco: "Estacio", valor: 4899.90, tipo: "avista", vlrP: 4378.28, qtd: 1, status: "pendente" },
    { id: 25, titular: "Felipe", banco: "Havan", valor: 5311.02, tipo: "avista", vlrP: 765.49, qtd: 1, status: "pendente" },
    { id: 26, titular: "Fernanda", banco: "Santander", valor: 8239.27, tipo: "avista", vlrP: 1472.72, qtd: 1, status: "pendente" },
    { id: 27, titular: "Felipe", banco: "Banco Pan (BTG)", valor: 52963.55, tipo: "avista", vlrP: 8956.14, qtd: 1, status: "pendente" }
];

const AppContent: React.FC = () => {
    const { theme } = useTheme();
    const formatBRLText = (val: number) => {
        try {
            const num = typeof val === 'number' && !isNaN(val) && isFinite(val) ? val : 0;
            return new Intl.NumberFormat('pt-BR').format(num);
        } catch {
            return (val || 0).toFixed(2).replace('.', ',');
        }
    };
    const [isAuthenticated, setIsAuthenticated] = useState(true);
    const [activeSection, setActiveSection] = useState('dashboard');
    const [notificationsActiveTab, setNotificationsActiveTab] = useState<'urgent' | 'all' | 'completed'>('urgent');
    const [notificationsSearchQuery, setNotificationsSearchQuery] = useState('');
    const [exchangeRate, setExchangeRate] = useState(5.00);
    const [transactions, setTransactions] = useState<Deposit[]>([]);
    const [objectives, setObjectives] = useState<Objective[]>(initialObjectives);
    const [debts, setDebts] = useState<any[]>(initialDebts);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [deliveryStats, setDeliveryStats] = useState({ profit: 0, totalProfitAllTime: 0, km: 0, gasolina: 0, manutencao: 0, ganhosBrutos: 0 });
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [financialOverview, setFinancialOverview] = useState<any>({
        despesasFixas: '2129',
        mensalidadeEstudos: '490',
        metaPoupanca: '3548.99',
        reservaEmergencia: '500',
        rendaFixaFernanda: '1000'
    });

    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [taskModalData, setTaskModalData] = useState<Partial<Task> | undefined>(undefined);

    const openTaskModal = (initialData?: Partial<Task>) => {
        setTaskModalData(initialData);
        setIsTaskModalOpen(true);
    };

    const handleGlobalSaveTask = async (taskData: Omit<Task, 'id' | 'completed'>) => {
        if (taskModalData?.id) {
            const updated = { ...taskData, id: taskModalData.id, completed: taskModalData.completed || false };
            await api.updateTask(updated);
            setTasks(prev => prev.map(t => t.id === taskModalData.id ? updated : t));
        } else {
            const newTask = await api.addTask({ ...taskData, completed: false });
            setTasks(prev => [...prev, newTask]);
        }
    };

    useEffect(() => {
        loadData();

        const fetchExchangeRate = async () => {
            try {
                const response = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL');
                const data = await response.json();
                const rate = parseFloat(data.USDBRL.bid);
                if (rate > 0) {
                    setExchangeRate(rate);
                    await api.updateSettings({ exchangeRate: rate });
                }
            } catch {}
        };

        fetchExchangeRate();
    }, []);

    useEffect(() => {
        const savedAuth = localStorage.getItem('is_authenticated');
        if (savedAuth === 'true') {
            localStorage.setItem('is_authenticated', 'true');
        }
    }, [isAuthenticated]);

    const loadData = async () => {
        try {
            const txs = await api.getTransactions();
            if (Array.isArray(txs)) setTransactions(txs);

            const objs = await api.getObjectives();
            if (Array.isArray(objs)) {
                if (objs.length === 0) {
                    for (const o of initialObjectives) {
                        await api.saveObjective(o);
                    }
                    setObjectives(initialObjectives);
                } else {
                    setObjectives(prev => {
                        const base = prev && prev.length > 0 ? prev : initialObjectives;
                        const combined = [...base];
                        objs.forEach((apiObj: Objective) => {
                            const index = combined.findIndex(o => o.id === apiObj.id);
                            if (index !== -1) {
                                combined[index] = { ...combined[index], ...apiObj };
                            } else {
                                combined.push(apiObj);
                            }
                        });
                        return combined;
                    });
                }
            }

            const dbts = await api.getDebts();
            if (Array.isArray(dbts)) {
                if (dbts.length === 0) {
                    for (const d of initialDebts) {
                        await api.addDebt(d);
                    }
                    setDebts(initialDebts);
                } else {
                    setDebts(dbts);
                }
            }

            const tsks = await api.getTasks();
            if (Array.isArray(tsks)) setTasks(tsks);

            const dStats = await api.getDeliveryStats();
            if (dStats) setDeliveryStats(dStats);

            const settings = await api.getSettings();
            if (settings && settings.financialOverview) {
                setFinancialOverview(prev => ({ ...prev, ...settings.financialOverview }));
            }
        } catch {}
    };

    const handleDeposit = async (deposit: Deposit, objectiveId?: string) => {
        try {
            const newTx = await api.addTransaction(deposit);
            setTransactions(prev => [newTx, ...prev]);

            if (objectiveId) {
                const targetObj = objectives.find(o => o.id === objectiveId);
                if (targetObj) {
                    const updated = { ...targetObj, accumulatedBRL: targetObj.accumulatedBRL + deposit.amountBRL };
                    await api.updateObjective(updated);
                    setObjectives(prev => prev.map(o => o.id === objectiveId ? updated : o));
                }
            }
        } catch (e) {
            console.error("Erro no depósito:", e);
        }
    };

    const handleToggleObjective = async (id: string) => {
        const obj = objectives.find(o => o.id === id);
        if (obj) {
            const updated = { ...obj, completed: !obj.completed };
            await api.updateObjective(updated);
            setObjectives(prev => prev.map(o => o.id === id ? updated : o));
        }
    };

    const handleToggleTaskComplete = async (taskId: string) => {
        const task = tasks.find(t => String(t.id) === String(taskId));
        if (task) {
            const updated = { ...task, completed: !task.completed, status: !task.completed ? 'done' as const : 'todo' as const };
            try {
                await api.updateTask(updated);
                setTasks(prev => prev.map(t => String(t.id) === String(taskId) ? updated : t));
            } catch (err) {
                console.error("Erro ao atualizar status da tarefa:", err);
            }
        }
    };

    const handleUpdateObjective = async (updatedObj: Objective) => {
        try {
            await api.updateObjective(updatedObj);
            setObjectives(prev => prev.map(o => o.id === updatedObj.id ? updatedObj : o));
        } catch (err) {
            console.error('Erro ao editar objetivo:', err);
            alert('Erro ao editar objetivo. Verifique o console.');
        }
    };

    const handleAddObjective = async (newObj: Partial<Objective>) => {
        const parsedTargetBRL = Number(newObj.targetBRL) || 0;
        const obj: Objective = {
            id: `obj-${Date.now()}`,
            icon: newObj.icon || '🎯',
            name: newObj.name || 'Novo Objetivo',
            targetBRL: parsedTargetBRL,
            targetUSD: exchangeRate > 0 ? (parsedTargetBRL / exchangeRate) : 0,
            accumulatedBRL: Number(newObj.accumulatedBRL) || 0,
            completed: false,
            category: newObj.category as any
        };
        try {
            const saved = await api.saveObjective(obj);
            setObjectives(prev => [...prev, saved || obj]);
        } catch {
            alert('Erro ao salvar objetivo.');
        }
    };

    const handleDeleteObjective = async (id: string) => {
        if (!window.confirm("⚠️ Tem certeza que deseja excluir este objetivo?")) return;
        await api.deleteObjective(id);
        setObjectives(prev => prev.filter(o => o.id !== id));
    };

    const handleDeleteTransaction = async (id: number) => {
        if (!window.confirm("⚠️ Tem certeza que deseja excluir esta transação?")) return;
        await api.deleteTransaction(id);
        setTransactions(prev => prev.filter(t => t.id !== id));
    };

    const handleDebtCRUD = {
        add: async (d: any) => {
            const newD = await api.addDebt(d);
            setDebts(prev => [...prev, newD]);
            if (newD.tipo === 'parcelado' && parseInt(newD.qtd) > 0) {
                const numParcelas = parseInt(newD.qtd);
                const valorParcela = typeof newD.vlrP === 'number' ? newD.vlrP : parseFloat(String(newD.vlrP).replace(',', '.'));
                const diaVencimento = parseInt(newD.vencimento) || 5;
                const paidCount = parseInt(newD.parcelasPagas) || 0;

                for (let i = 1; i <= numParcelas; i++) {
                    const taskDateObj = new Date();
                    taskDateObj.setMonth(taskDateObj.getMonth() + (i - 1));

                    const lastDayOfMonth = new Date(taskDateObj.getFullYear(), taskDateObj.getMonth() + 1, 0).getDate();
                    taskDateObj.setDate(Math.min(diaVencimento, lastDayOfMonth));

                    const taskDate = taskDateObj.toISOString().split('T')[0];
                    const isAlreadyPaid = i <= paidCount;
                    const newTask = await api.addTask({
                        title: `Contrato ${newD.banco}: Parcela ${i}/${numParcelas}`,
                        date: taskDate,
                        description: `Pagamento da parcela ${i} de ${numParcelas} no valor de R$ ${valorParcela.toFixed(2)} (${newD.titular})`,
                        completed: isAlreadyPaid,
                        status: isAlreadyPaid ? 'done' : 'todo',
                        priority: 'normal',
                        referenceId: newD.id,
                        referenceType: 'DEBT'
                    });
                    setTasks(prev => [...prev, newTask]);
                }
            }
        },
        update: async (d: any) => {
            const oldDebt = debts.find(item => item.id === d.id);
            await api.updateDebt(d);
            setDebts(prev => prev.map(item => item.id === d.id ? d : item));

            // Remove existing tasks for this debt to prevent duplicates before generating new ones
            const tasksToDelete = tasks.filter(t => String(t.referenceId) === String(d.id) && t.referenceType === 'DEBT');
            for (const t of tasksToDelete) {
                await api.deleteTask(t.id);
            }
            const filteredTasks = tasks.filter(t => !(String(t.referenceId) === String(d.id) && t.referenceType === 'DEBT'));

            let newGeneratedTasks: any[] = [];
            if (d.tipo === 'parcelado') {
                const numParcelas = parseInt(d.qtd);
                const valorParcela = typeof d.vlrP === 'number' ? d.vlrP : parseFloat(String(d.vlrP).replace(',', '.'));
                const diaVencimento = parseInt(d.vencimento) || 5;
                const paidCount = parseInt(d.parcelasPagas) || 0;

                for (let i = 1; i <= numParcelas; i++) {
                    const taskDateObj = new Date();
                    taskDateObj.setMonth(taskDateObj.getMonth() + (i - 1));
                    const lastDayOfMonth = new Date(taskDateObj.getFullYear(), taskDateObj.getMonth() + 1, 0).getDate();
                    taskDateObj.setDate(Math.min(diaVencimento, lastDayOfMonth));

                    const taskDate = taskDateObj.toISOString().split('T')[0];
                    const isAlreadyPaid = i <= paidCount;
                    const newTask = await api.addTask({
                        title: `Contrato ${d.banco}: Parcela ${i}/${numParcelas}`,
                        date: taskDate,
                        description: `Pagamento da parcela ${i} de ${numParcelas} no valor de R$ ${valorParcela.toFixed(2)} (${d.titular})`,
                        completed: isAlreadyPaid,
                        status: isAlreadyPaid ? 'done' : 'todo',
                        priority: 'normal',
                        referenceId: d.id,
                        referenceType: 'DEBT'
                    });
                    newGeneratedTasks.push(newTask);
                }
            }
            setTasks([...filteredTasks, ...newGeneratedTasks]);
        },
        remove: async (id: any) => {
            await api.deleteDebt(id);
            setDebts(prev => prev.filter(item => item.id !== id));
            
            // Delete associated tasks
            const tasksToDelete = tasks.filter(t => String(t.referenceId) === String(id) && t.referenceType === 'DEBT');
            for (const t of tasksToDelete) {
                await api.deleteTask(t.id);
            }
            setTasks(prev => prev.filter(t => !(String(t.referenceId) === String(id) && t.referenceType === 'DEBT')));
        }
    };

    const parseBRLValue = (value: any): number => {
        if (typeof value === 'number') return value;
        if (!value) return 0;
        const s = String(value).trim();
        if (s.includes(',')) {
            const clean = s.replace(/\./g, '').replace(',', '.');
            return parseFloat(clean) || 0;
        }
        return parseFloat(s) || 0;
    };

    const effectiveObjectives = objectives && objectives.length > 0 ? objectives : initialObjectives;

    const totalRemainingDebtsBRL = debts.filter(d => d.status !== 'quitado').reduce((sum, d) => {
        const vP = parseBRLValue(d.vlrP) || 0;
        const qT = parseInt(d.qtd) || 1;
        const qP = parseInt(d.parcelasPagas) || 0;
        const qRem = Math.max(0, qT - qP);
        const ent = (qP === 0) ? (parseBRLValue(d.entrada) || 0) : 0;
        return sum + (vP * qRem) + ent;
    }, 0);

    const totalRemainingObjectivesBRL = effectiveObjectives.filter(obj => !obj.completed).reduce((sum, obj) => sum + (Number(obj.targetBRL) || 0), 0);
    const totalRemainingBRL = totalRemainingDebtsBRL + totalRemainingObjectivesBRL;
    const totalRemainingUSD = exchangeRate > 0 ? totalRemainingBRL / exchangeRate : 0;

    const originalAdjustedDebtSum = debts.reduce((sum, d) => {
        if (d.status === 'quitado') {
            const vP = parseBRLValue(d.vlrP) || 0;
            const qT = parseInt(d.qtd) || 1;
            const ent = parseBRLValue(d.entrada) || 0;
            const totalPago = (vP * qT) + ent;
            return sum + (totalPago > 0 ? totalPago : (parseBRLValue(d.valor) || 0));
        }
        return sum + (parseBRLValue(d.valor) || 0);
    }, 0);
    const originalObjSum = effectiveObjectives.reduce((sum, obj) => sum + (Number(obj.targetBRL) || 0), 0);
    const originalTotalTargetBRL = 300000;

    const remainingAdjustedDebtSum = debts.filter(d => d.status !== 'quitado').reduce((sum, d) => {
        return sum + (parseBRLValue(d.valor) || 0);
    }, 0);
    const remainingObjSum = effectiveObjectives.filter(obj => !obj.completed).reduce((sum, obj) => sum + (Number(obj.targetBRL) || 0), 0);

    const totalTargetBRL = 300000;
    const totalTargetUSD = exchangeRate > 0 ? totalTargetBRL / exchangeRate : 0;

    const historicalDebtPaid = debts.filter(d => d.status === 'quitado').reduce((sum, d) => {
        const vP = parseBRLValue(d.vlrP) || 0;
        const qT = parseInt(d.qtd) || 1;
        const ent = parseBRLValue(d.entrada) || 0;
        const totalPago = (vP * qT) + ent;
        return sum + (totalPago > 0 ? totalPago : (parseBRLValue(d.valor) || 0));
    }, 0);

    const historicalObjDone = effectiveObjectives.filter(obj => obj.completed).reduce((sum, obj) => sum + (Number(obj.targetBRL) || 0), 0);
    const cashDeposits = transactions.reduce((sum, tx) => sum + tx.amountBRL, 0);
    const realizedExtraIncome = deliveryStats.totalProfitAllTime || 0;
    const accumulatedBRL = cashDeposits + realizedExtraIncome;
    const progressBRL = cashDeposits + historicalDebtPaid + historicalObjDone + realizedExtraIncome;

    const progressPercent = originalTotalTargetBRL > 0 ? (progressBRL / originalTotalTargetBRL) * 100 : 0;

    // Saldo mensal: receitas - despesas (para exibir no painel do header)
    const rFernanda = parseBRLValue(financialOverview.rendaFixaFernanda || '1000');
    const rExtraAtual = deliveryStats.profit || 0;
    const dFixas = parseBRLValue(financialOverview.despesasFixas || '2129');
    const mEstudos = parseBRLValue(financialOverview.mensalidadeEstudos || '490');
    const mPoupanca = parseBRLValue(financialOverview.metaPoupanca || '3548.99');
    const rEmergencia = parseBRLValue(financialOverview.reservaEmergencia || '500');
    const totalRendaMensal = rFernanda + rExtraAtual;
    const totalDespesasMensal = dFixas + mEstudos + mPoupanca + rEmergencia;
    const saldoMensal = totalRendaMensal - totalDespesasMensal;

    const getDailyDeliveryTarget = () => {
        const dFixas = parseBRLValue(financialOverview.despesasFixas);
        const mEstudos = parseBRLValue(financialOverview.mensalidadeEstudos);
        const mPoupanca = parseBRLValue(financialOverview.metaPoupanca || '3548.99');
        const rEmergencia = parseBRLValue(financialOverview.reservaEmergencia);
        const totalDespesas = dFixas + mEstudos + mPoupanca + rEmergencia;
        return totalDespesas / 30;
    };

    const totalDebtsOriginalBRL = debts.filter(d => d.status !== 'quitado').reduce((sum, d) => sum + (parseBRLValue(d.valor) || 0), 0);
    const totalDebtsPropostaBRL = totalRemainingDebtsBRL;
    const totalObjectivesBRL = totalRemainingObjectivesBRL;

    const renderContent = () => {
        try {
            switch (activeSection) {
                case 'dashboard':
                    return (
                        <DashboardView
                            exchangeRate={exchangeRate}
                            transactions={transactions}
                            onDeposit={handleDeposit}
                            accumulatedBRL={accumulatedBRL}
                            totalTargetBRL={totalTargetBRL}
                            totalTargetUSD={totalTargetUSD}
                            totalObjectivesBRL={totalObjectivesBRL}
                            totalDebtsOriginalBRL={totalDebtsOriginalBRL}
                            totalDebtsPropostaBRL={totalDebtsPropostaBRL}
                            objectives={objectives}
                            debts={debts}
                            onDelete={handleDeleteTransaction}
                            dailyDeliveryTarget={getDailyDeliveryTarget()}
                            progressBRL={progressBRL}
                            progressPercent={progressPercent}
                        />
                    );
                case 'overview':
                    return <FinancialOverview debts={debts} totalTargetBRL={totalTargetBRL} totalDebtsPropostaBRL={totalDebtsPropostaBRL} />;
                case 'meta':
                    return (
                        <JourneyInfo 
                            objectives={objectives} 
                            transactions={transactions} 
                            exchangeRate={exchangeRate}
                            accumulatedBRL={accumulatedBRL}
                            targetBRL={totalTargetBRL}
                            targetUSD={totalTargetUSD}
                            debts={debts}
                        />
                    );
                case 'br_goals':
                    return (
                        <Objectives
                            category="BR"
                            objectives={objectives}
                            onToggleComplete={handleToggleObjective}
                            onAddObjective={handleAddObjective}
                            onDeleteObjective={handleDeleteObjective}
                            onUpdateObjective={handleUpdateObjective}
                            exchangeRate={exchangeRate}
                            onScheduleTask={openTaskModal}
                        />
                    );
                case 'usa_goals':
                    return (
                        <Objectives
                            category="USA"
                            objectives={objectives}
                            onToggleComplete={handleToggleObjective}
                            onAddObjective={handleAddObjective}
                            onDeleteObjective={handleDeleteObjective}
                            onUpdateObjective={handleUpdateObjective}
                            exchangeRate={exchangeRate}
                            onScheduleTask={openTaskModal}
                        />
                    );
                case 'emergency':
                    return (
                        <Objectives
                            category="EMERGENCY"
                            objectives={objectives}
                            onToggleComplete={handleToggleObjective}
                            onAddObjective={handleAddObjective}
                            onDeleteObjective={handleDeleteObjective}
                            onUpdateObjective={handleUpdateObjective}
                            exchangeRate={exchangeRate}
                            onScheduleTask={openTaskModal}
                        />
                    );
                case 'objectives':
                    return (
                        <div className="objectives-page">
                            <Objectives
                                category="BR"
                                objectives={objectives}
                                onToggleComplete={handleToggleObjective}
                                onAddObjective={handleAddObjective}
                                onDeleteObjective={handleDeleteObjective}
                                onUpdateObjective={handleUpdateObjective}
                                exchangeRate={exchangeRate}
                                onScheduleTask={openTaskModal}
                            />
                            <Objectives
                                category="USA"
                                objectives={objectives}
                                onToggleComplete={handleToggleObjective}
                                onAddObjective={handleAddObjective}
                                onDeleteObjective={handleDeleteObjective}
                                onUpdateObjective={handleUpdateObjective}
                                exchangeRate={exchangeRate}
                                onScheduleTask={openTaskModal}
                            />
                            <Objectives
                                category="EMERGENCY"
                                objectives={objectives}
                                onToggleComplete={handleToggleObjective}
                                onAddObjective={handleAddObjective}
                                onDeleteObjective={handleDeleteObjective}
                                onUpdateObjective={handleUpdateObjective}
                                exchangeRate={exchangeRate}
                                onScheduleTask={openTaskModal}
                            />
                        </div>
                    );
                case 'tasks':
                    return <TasksView tasks={tasks} setTasks={setTasks} objectives={objectives} debts={debts} />;
                case 'report':
                    return <ReportView accumulatedBRL={accumulatedBRL} objectives={objectives} targetBRL={totalTargetBRL} />;
                case 'premium':
                    return (
                        <PremiumDashboard 
                            debts={debts} 
                            tasks={tasks}
                            onAdd={handleDebtCRUD.add}
                            onUpdate={handleDebtCRUD.update}
                            onRemove={handleDebtCRUD.remove}
                            onScheduleTask={openTaskModal}
                        />
                    );
                case 'delivery':
                    return <DeliveryTracker onRefresh={loadData} />;
                case 'notifications': {
                    const todayDateStr = new Date().toDateString();
                    const pendingTasksList = tasks.filter(t => !t.completed);
                    const urgentTasksList = pendingTasksList.filter(t => {
                        if (!t.date) return false;
                        const taskDateObj = new Date(t.date + 'T12:00:00');
                        if (isNaN(taskDateObj.getTime())) return false;
                        return taskDateObj <= new Date(todayDateStr);
                    });

                    const filteredNotifications = (
                        notificationsActiveTab === 'urgent' 
                            ? urgentTasksList 
                            : notificationsActiveTab === 'all' 
                                ? pendingTasksList 
                                : tasks.filter(t => t.completed)
                    ).filter(t => 
                        t.title.toLowerCase().includes(notificationsSearchQuery.toLowerCase()) || 
                        (t.description || '').toLowerCase().includes(notificationsSearchQuery.toLowerCase())
                    );

                    return (
                        <div className="premium-container" style={{maxWidth: '1000px', margin: '0 auto', padding: '20px'}}>
                            <div className="premium-header" style={{marginBottom: '25px'}}>
                                <h2 style={{fontSize: '1.8rem', fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', gap: '10px'}}>
                                    <span>🔔</span> Central de Avisos & Lembretes
                                </h2>
                                <p style={{color: 'rgba(255, 255, 255, 0.6)', marginTop: '5px'}}>
                                    Fique de olho nas suas parcelas e compromissos. Você tem <strong style={{color: '#e74c3c'}}>{urgentTasksList.length}</strong> pendências urgentes e <strong style={{color: '#3498db'}}>{pendingTasksList.length}</strong> no total.
                                </p>
                            </div>

                            <div style={{background: 'rgba(20, 20, 30, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '20px', overflow: 'hidden'}} className="glass">
                                <div style={{padding: '20px', background: 'rgba(0, 0, 0, 0.2)', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'space-between', alignItems: 'center'}}>
                                    <div className="notification-modal-tabs" style={{border: 'none', padding: 0, background: 'transparent', width: 'auto', display: 'flex'}}>
                                        <button 
                                            className={`modal-tab-btn ${notificationsActiveTab === 'urgent' ? 'active' : ''}`}
                                            onClick={() => setNotificationsActiveTab('urgent')}
                                            style={{padding: '10px 20px', fontSize: '0.9rem'}}
                                        >
                                            🚨 Urgentes ({urgentTasksList.length})
                                        </button>
                                        <button 
                                            className={`modal-tab-btn ${notificationsActiveTab === 'all' ? 'active' : ''}`}
                                            onClick={() => setNotificationsActiveTab('all')}
                                            style={{padding: '10px 20px', fontSize: '0.9rem'}}
                                        >
                                            📋 Todas ({pendingTasksList.length})
                                        </button>
                                        <button 
                                            className={`modal-tab-btn ${notificationsActiveTab === 'completed' ? 'active' : ''}`}
                                            onClick={() => setNotificationsActiveTab('completed')}
                                            style={{padding: '10px 20px', fontSize: '0.9rem'}}
                                        >
                                            ✅ Concluídas ({tasks.filter(t => t.completed).length})
                                        </button>
                                    </div>
                                    <div style={{width: '300px', maxWidth: '100%'}}>
                                        <input 
                                            type="text" 
                                            placeholder="🔍 Buscar aviso ou parcela..." 
                                            value={notificationsSearchQuery} 
                                            onChange={(e) => setNotificationsSearchQuery(e.target.value)}
                                            className="modal-search-input"
                                            style={{padding: '8px 15px', borderRadius: '10px', fontSize: '0.85rem'}}
                                        />
                                    </div>
                                </div>

                                <div style={{padding: '25px', maxHeight: '600px', overflowY: 'auto'}}>
                                    {filteredNotifications.length === 0 ? (
                                        <div className="modal-no-tasks" style={{padding: '40px 20px'}}>
                                            <div className="no-tasks-icon">🎉</div>
                                            <p>Nenhuma notificação encontrada nesta aba!</p>
                                        </div>
                                    ) : (
                                        <div className="modal-tasks-list">
                                            {filteredNotifications.map(task => {
                                                const hasDate = !!task.date;
                                                const taskDateObj = hasDate ? new Date(task.date + 'T12:00:00') : new Date(NaN);
                                                const isLate = !task.completed && !isNaN(taskDateObj.getTime()) && taskDateObj < new Date(todayDateStr);
                                                const daysLate = isLate ? Math.floor((new Date(todayDateStr).getTime() - taskDateObj.getTime()) / (1000 * 3600 * 24)) : 0;

                                                return (
                                                    <div key={task.id} className={`modal-task-item ${task.completed ? 'completed' : isLate ? 'late' : 'pending'}`}>
                                                        <div className="task-indicator-dot"></div>
                                                        <div className="modal-task-content-wrapper">
                                                            <div className="modal-task-main-info">
                                                                <span className="modal-task-title">{task.title}</span>
                                                                {task.description && <p className="modal-task-desc" style={{margin: '4px 0 0 0'}}>{task.description}</p>}
                                                            </div>
                                                            <div className="modal-task-date-info">
                                                                <span className="modal-task-date-badge">
                                                                    📅 {hasDate ? task.date : 'Sem data'}
                                                                </span>
                                                                {isLate && (
                                                                    <span className="modal-task-status-badge late">
                                                                        ⚠️ Atrasada {daysLate} dia{daysLate > 1 ? 's' : ''}
                                                                    </span>
                                                                )}
                                                                {task.completed && (
                                                                    <span className="modal-task-status-badge done">
                                                                        ✅ Concluída
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="modal-task-actions">
                                                            <button 
                                                                className={`modal-task-action-btn ${task.completed ? 'undo' : 'complete'}`}
                                                                onClick={() => handleToggleTaskComplete(task.id)}
                                                                title={task.completed ? "Marcar como pendente" : "Marcar como concluída"}
                                                            >
                                                                {task.completed ? "↩ Refazer" : "✓ Concluir"}
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                }
                default:
                    return (
                        <DashboardView
                            exchangeRate={exchangeRate}
                            transactions={transactions}
                            onDeposit={handleDeposit}
                            accumulatedBRL={accumulatedBRL}
                            totalTargetBRL={totalTargetBRL}
                            totalTargetUSD={totalTargetUSD}
                            totalObjectivesBRL={totalObjectivesBRL}
                            totalDebtsOriginalBRL={totalDebtsOriginalBRL}
                            totalDebtsPropostaBRL={totalDebtsPropostaBRL}
                            objectives={objectives}
                            debts={debts}
                            onDelete={handleDeleteTransaction}
                            dailyDeliveryTarget={getDailyDeliveryTarget()}
                            progressBRL={progressBRL}
                            progressPercent={progressPercent}
                        />
                    );
            }
        } catch (e) {
            console.error("Erro ao renderizar seção:", activeSection, e);
            return <div className="error-fallback">Ocorreu um erro ao carregar esta seção.</div>;
        }
    };

    try {
        if (!isAuthenticated) {
            return <LoginView onLogin={setIsAuthenticated} />;
        }

        return (
            <>
            <div className="app-layout">
                {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}

                <Sidebar
                    activeSection={activeSection}
                    onNavigate={(s) => {
                        setActiveSection(s);
                        setIsSidebarOpen(false);
                    }}
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                    onLogout={() => setIsAuthenticated(false)}
                />

                <main className="main-content">
                    <header className="top-bar">
                        <div className="header-left">
                            <button className="hamburger-btn" onClick={() => setIsSidebarOpen(true)}>☰</button>
                            <h1 className="page-title">
                                {activeSection === 'dashboard' ? 'Painel Principal' :
                                 activeSection === 'overview' ? 'Visão Geral' :
                                 activeSection === 'meta' ? 'Metas & Saldo' :
                                 activeSection === 'br_goals' ? 'Objetivos BR' :
                                 activeSection === 'usa_goals' ? 'Objetivos USA' :
                                 activeSection === 'emergency' ? 'Emergência' :
                                 activeSection === 'tasks' ? 'Tarefas' :
                                 activeSection === 'objectives' ? 'Todos os Objetivos' :
                                 activeSection === 'premium' ? 'Contas 2026' :
                                 activeSection === 'delivery' ? 'Entregas' :
                                 activeSection === 'notifications' ? 'Avisos & Alertas' :
                                 'Relatório'}
                            </h1>
                        </div>

                        <div className="header-controls">
                            <TaskNotificationWidget 
                                tasks={tasks} 
                                onOpenTasks={() => setActiveSection('notifications')} 
                                onToggleComplete={handleToggleTaskComplete} 
                            />
                            <Clock />
                            <div className="total-goal-badge">
                                <span className="total-goal-icon">🎯</span>
                                <div className="total-goal-info">
                                    <span className="total-goal-label">Progresso Financeiro</span>
                                    <div style={{display: 'flex', flexDirection: 'column', gap: '3px'}}>
                                        <span className="total-goal-brl" style={{fontSize: '1rem'}}>Meta: R$ {formatBRLText(totalTargetBRL)}</span>
                                        <span className="total-goal-usd" style={{fontSize: '0.8rem', color: '#10b981', fontWeight: 800}}>Acumulado: R$ {formatBRLText(accumulatedBRL)}</span>
                                        <span className="total-goal-usd" style={{fontSize: '0.7rem', color: '#3498db'}}>Pendente: R$ {formatBRLText(totalTargetBRL - accumulatedBRL)}</span>
                                        <span style={{fontSize: '0.7rem', fontWeight: 800, color: saldoMensal < 0 ? '#ef4444' : '#10b981'}}>
                                            {saldoMensal < 0
                                                ? `🔴 Negativo: - R$ ${formatBRLText(Math.abs(saldoMensal))}`
                                                : `🟢 Mês OK: + R$ ${formatBRLText(saldoMensal)}`
                                            }
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="exchange-rate-badge">
                                <span className="rate-label">Cotação Dólar (USD)</span>
                                <div className="rate-controls">
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={exchangeRate}
                                        onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 0)}
                                        className="rate-input-small"
                                    />
                                    <span className="rate-value">R$ {typeof exchangeRate === 'number' && !isNaN(exchangeRate) ? exchangeRate.toFixed(2) : '5.00'}</span>
                                </div>
                            </div>
                        </div>
                    </header>

                    <div className="content-area" key={activeSection}>
                        {renderContent()}
                    </div>
                </main>
            </div>
            <TaskModal 
                isOpen={isTaskModalOpen} 
                onClose={() => setIsTaskModalOpen(false)} 
                onSave={handleGlobalSaveTask} 
                initialData={taskModalData}
                objectives={objectives}
                debts={debts}
            />
            </>
        );
    } catch (e) {
        console.error("[AppContent] CRITICAL RENDER ERROR:", e);
        return <div style={{color:'red', padding:'50px', background:'white', zIndex: 9999}}>ERRO CRÍTICO NA RENDERIZAÇÃO DO APP!</div>;
    }
};

const App: React.FC = () => {
    return (
        <ThemeProvider>
            <AppContent />
        </ThemeProvider>
    );
};

export default App;
