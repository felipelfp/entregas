import { Objective } from '../components/Objectives';
import { Deposit } from '../components/DepositForm';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const getLocal = (key: string) => {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        console.error(`Erro ao ler ${key} do localStorage:`, e);
        return null;
    }
};

const setLocal = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
};

export const api = {
    getSettings: async () => {
        try {
            const response = await fetch(`${API_URL}/settings`);
            if (!response.ok) throw new Error();
            const data = await response.json();
            setLocal('settings', data);
            return data;
        } catch {
            return getLocal('settings') || { exchangeRate: 5.0 };
        }
    },
    updateSettings: async (settings: { exchangeRate: number }) => {
        try {
            const response = await fetch(`${API_URL}/settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            });
            const data = await response.json();
            setLocal('settings', data);
            return data;
        } catch {
            setLocal('settings', settings);
            return settings;
        }
    },

    getObjectives: async () => {
        try {
            const response = await fetch(`${API_URL}/objectives`);
            if (!response.ok) throw new Error();
            const data = await response.json();
            const local = getLocal('objectives');
            if (data.length === 0 && local && local.length > 0) {
                const validLocal = local.filter((o: any) => o.id && o.name);
                for (const o of validLocal) {
                    await api.saveObjective(o);
                }
                return validLocal;
            }
            setLocal('objectives', data);
            return data;
        } catch {
            return getLocal('objectives') || [];
        }
    },
    saveObjective: async (objective: Objective) => {
        try {
            const response = await fetch(`${API_URL}/objectives`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(objective),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erro HTTP: ${response.status} ${errorText}`);
            }
            const data = await response.json();
            const local = getLocal('objectives') || [];
            const exists = local.some((o: any) => o.id === data.id);
            const updatedLocal = exists ? local.map((o: any) => o.id === data.id ? data : o) : [...local, data];
            setLocal('objectives', updatedLocal);
            return data;
        } catch (err) {
            const local = getLocal('objectives') || [];
            const exists = local.some((o: any) => o.id === objective.id);
            const updatedLocal = exists ? local.map((o: any) => o.id === objective.id ? objective : o) : [...local, objective];
            setLocal('objectives', updatedLocal);
            return objective;
        }
    },
    updateObjective: async (objective: Objective) => {
        try {
            await fetch(`${API_URL}/objectives/${objective.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(objective),
            });
            const local = getLocal('objectives') || [];
            setLocal('objectives', local.map((o: any) => o.id === objective.id ? objective : o));
            return true;
        } catch {
            const local = getLocal('objectives') || [];
            setLocal('objectives', local.map((o: any) => o.id === objective.id ? objective : o));
            return true;
        }
    },

    getTransactions: async () => {
        try {
            const response = await fetch(`${API_URL}/transactions`);
            if (!response.ok) throw new Error();
            const data = await response.json();
            setLocal('transactions', data);
            return data;
        } catch {
            return getLocal('transactions') || [];
        }
    },
    addTransaction: async (transaction: Deposit) => {
        try {
            const response = await fetch(`${API_URL}/transactions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(transaction),
            });
            const data = await response.json();
            const local = getLocal('transactions') || [];
            const exists = local.some((t: any) => t.id === data.id);
            const updatedLocal = exists ? local.map((t: any) => t.id === data.id ? data : t) : [data, ...local];
            setLocal('transactions', updatedLocal);
            return data;
        } catch {
            const local = getLocal('transactions') || [];
            const mockData = { ...transaction, id: Date.now() };
            const exists = local.some((t: any) => t.id === mockData.id);
            const updatedLocal = exists ? local.map((t: any) => t.id === mockData.id ? mockData : t) : [mockData, ...local];
            setLocal('transactions', updatedLocal);
            return mockData;
        }
    },
    deleteTransaction: async (id: number) => {
        try {
            await fetch(`${API_URL}/transactions/${id}`, { method: 'DELETE' });
            const local = getLocal('transactions') || [];
            setLocal('transactions', local.filter((t: any) => t.id !== id));
            return true;
        } catch {
            const local = getLocal('transactions') || [];
            setLocal('transactions', local.filter((t: any) => t.id !== id));
            return true;
        }
    },

    getDebts: async () => {
        try {
            const response = await fetch(`${API_URL}/debts`);
            if (!response.ok) throw new Error();
            const data = await response.json();
            const local = getLocal('debts');
            if (data.length === 0 && local && local.length > 0) {
                for (const d of local) {
                    await api.addDebt(d);
                }
                return local;
            }
            setLocal('debts', data);
            return data;
        } catch {
            return getLocal('debts') || [];
        }
    },
    addDebt: async (debt: any) => {
        try {
            const response = await fetch(`${API_URL}/debts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(debt),
            });
            const data = await response.json();
            const local = getLocal('debts') || [];
            const exists = local.some((d: any) => d.id === data.id);
            const updatedLocal = exists ? local.map((d: any) => d.id === data.id ? data : d) : [...local, data];
            setLocal('debts', updatedLocal);
            return data;
        } catch {
            const local = getLocal('debts') || [];
            const mockData = { ...debt, id: Date.now() };
            const exists = local.some((d: any) => d.id === mockData.id);
            const updatedLocal = exists ? local.map((d: any) => d.id === mockData.id ? mockData : d) : [...local, mockData];
            setLocal('debts', updatedLocal);
            return mockData;
        }
    },
    updateDebt: async (debt: any) => {
        try {
            await fetch(`${API_URL}/debts/${debt.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(debt),
            });
            const local = getLocal('debts') || [];
            setLocal('debts', local.map((d: any) => d.id === debt.id ? debt : d));
            return true;
        } catch {
            const local = getLocal('debts') || [];
            setLocal('debts', local.map((d: any) => d.id === debt.id ? debt : d));
            return true;
        }
    },
    deleteDebt: async (id: number) => {
        try {
            await fetch(`${API_URL}/debts/${id}`, { method: 'DELETE' });
            const local = getLocal('debts') || [];
            setLocal('debts', local.filter((d: any) => d.id !== id));
            return true;
        } catch {
            const local = getLocal('debts') || [];
            setLocal('debts', local.filter((d: any) => d.id !== id));
            return true;
        }
    },
    deleteObjective: async (id: string) => {
        try {
            await fetch(`${API_URL}/objectives/${id}`, { method: 'DELETE' });
            const local = getLocal('objectives') || [];
            setLocal('objectives', local.filter((o: any) => o.id !== id));
            return true;
        } catch {
            const local = getLocal('objectives') || [];
            setLocal('objectives', local.filter((o: any) => o.id !== id));
            return true;
        }
    },

    getTasks: async () => {
        try {
            const response = await fetch(`${API_URL}/tasks`);
            if (!response.ok) throw new Error();
            const data = await response.json();
            const local = getLocal('tasks');
            if (data.length === 0 && local && local.length > 0) {
                for (const t of local) {
                    await api.addTask(t);
                }
                return local;
            }
            setLocal('tasks', data);
            return data;
        } catch {
            return getLocal('tasks') || [];
        }
    },
    addTask: async (task: any) => {
        try {
            const response = await fetch(`${API_URL}/tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(task),
            });
            const data = await response.json();
            const local = getLocal('tasks') || [];
            const exists = local.some((t: any) => t.id === data.id);
            const updatedLocal = exists ? local.map((t: any) => t.id === data.id ? data : t) : [...local, data];
            setLocal('tasks', updatedLocal);
            return data;
        } catch {
            const local = getLocal('tasks') || [];
            const mockData = { ...task, id: Date.now().toString() };
            const exists = local.some((t: any) => t.id === mockData.id);
            const updatedLocal = exists ? local.map((t: any) => t.id === mockData.id ? mockData : t) : [...local, mockData];
            setLocal('tasks', updatedLocal);
            return mockData;
        }
    },
    updateTask: async (task: any) => {
        try {
            await fetch(`${API_URL}/tasks/${task.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(task),
            });
            const local = getLocal('tasks') || [];
            setLocal('tasks', local.map((t: any) => t.id === task.id ? task : t));
            return true;
        } catch {
            const local = getLocal('tasks') || [];
            setLocal('tasks', local.map((t: any) => t.id === task.id ? task : t));
            return true;
        }
    },
    deleteTask: async (id: string) => {
        try {
            await fetch(`${API_URL}/tasks/${id}`, { method: 'DELETE' });
            const local = getLocal('tasks') || [];
            setLocal('tasks', local.filter((t: any) => t.id !== id));
            return true;
        } catch {
            const local = getLocal('tasks') || [];
            setLocal('tasks', local.filter((t: any) => t.id !== id));
            return true;
        }
    },

    getReports: async () => {
        try {
            const response = await fetch(`${API_URL}/reports`);
            if (!response.ok) throw new Error();
            return await response.json();
        } catch { return []; }
    },
    saveMonth: async (reportData: any) => {
        try {
            const response = await fetch(`${API_URL}/save-month`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reportData),
            });
            return await response.json();
        } catch {
            return null;
        }
    },
    deleteSavedMonth: async (id: string) => {
        try {
            const response = await fetch(`${API_URL}/reports/${id}`, { method: 'DELETE' });
            return response.ok;
        } catch { return false; }
    },
    exportReportsCSV: () => {
        window.open(`${API_URL}/export-csv`, '_blank');
    },
    getDeliveryStats: async () => {
        try {
            const response = await fetch(`${API_URL}/delivery-stats`);
            if (!response.ok) throw new Error();
            return await response.json();
        } catch {
            return { profit: 0, km: 0, gasolina: 0, manutencao: 0, ganhosBrutos: 0 };
        }
    },
    getDeliveryHistory: async () => {
        try {
            const response = await fetch(`${API_URL}/delivery-history`);
            if (!response.ok) throw new Error();
            return await response.json();
        } catch { return []; }
    },
    saveDeliveryRecord: async (record: any) => {
        try {
            const response = await fetch(`${API_URL}/delivery-save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(record)
            });
            return response.ok;
        } catch { return false; }
    },
    deleteDeliveryRecord: async (id: string) => {
        try {
            const response = await fetch(`${API_URL}/delivery-history/${id}`, { method: 'DELETE' });
            return response.ok;
        } catch { return false; }
    }
};
