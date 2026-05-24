import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import './FinancialOverview.css';

interface FinancialOverviewProps {
    debts?: any[];
    totalTargetBRL?: number;
    totalDebtsPropostaBRL?: number;
}

const FinancialOverview: React.FC<FinancialOverviewProps> = ({ 
    debts = [], 
    totalTargetBRL = 0,
    totalDebtsPropostaBRL = 0
}) => {

    const [rendaFixaFelipe, setRendaFixaFelipe] = useState<string>('0');
    const [rendaFixaFernanda, setRendaFixaFernanda] = useState<string>('1000');
    const [metaRendaExtra, setMetaRendaExtra] = useState<string>('0');
    const [rendaExtraRealizada, setRendaExtraRealizada] = useState<string>('');
    const [despesasFixas, setDespesasFixas] = useState<string>('2129');
    const [mensalidadeEstudos, setMensalidadeEstudos] = useState<string>('490');
    const [metaPoupanca, setMetaPoupanca] = useState<string>('');
    const [reservaEmergencia, setReservaEmergencia] = useState<string>('500');
    const [isLoaded, setIsLoaded] = useState(false);
    const [deliveryStats, setDeliveryStats] = useState<any>({ profit: 0, totalProfitAllTime: 0, km: 0, gasolina: 0, manutencao: 0, ganhosBrutos: 0 });
    const [history, setHistory] = useState<any[]>([]);

    const formatBRL = (value: number) => {
        try {
            const num = typeof value === 'number' && !isNaN(value) && isFinite(value) ? value : 0;
            return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        } catch {
            return (value || 0).toFixed(2).replace('.', ',');
        }
    };

    const parseBRLValue = (value: string | number): number => {
        if (typeof value === 'number') return value;
        if (!value) return 0;
        
        let str = String(value).trim();
        
        // If there are both dots and commas
        if (str.includes('.') && str.includes(',')) {
            const firstDot = str.indexOf('.');
            const firstComma = str.indexOf(',');
            if (firstDot < firstComma) {
                // Brazilian format: 1.234,56
                str = str.replace(/\./g, '').replace(',', '.');
            } else {
                // US format: 1,234.56
                str = str.replace(/,/g, '');
            }
        } else if (str.includes(',')) {
            // Replaces single comma with dot for decimals if it looks like a decimal part
            const parts = str.split(',');
            if (parts.length === 2 && parts[1].length <= 2) {
                str = str.replace(',', '.');
            } else {
                str = str.replace(/,/g, '');
            }
        } else if (str.includes('.')) {
            // If it ends with .XX (like .56), keep the dot. Otherwise strip it as thousands.
            const parts = str.split('.');
            if (parts.length === 2 && parts[1].length <= 2) {
                // Decimals, keep the dot
            } else {
                // Thousands
                str = str.replace(/\./g, '');
            }
        }
        
        const num = parseFloat(str);
        return isNaN(num) ? 0 : num;
    };

    const calculatedMonthlyGoal = totalTargetBRL > 0 ? (totalTargetBRL / 100).toFixed(2) : '3548.99';

    useEffect(() => {
        const fetchData = async () => {
            try {
                const settings = await api.getSettings();
                if (settings && settings.financialOverview) {
                    const fo = settings.financialOverview;
                    if (fo.rendaFixaFelipe !== undefined) setRendaFixaFelipe(fo.rendaFixaFelipe);
                    if (fo.rendaFixaFernanda !== undefined) setRendaFixaFernanda(fo.rendaFixaFernanda);
                    if (fo.metaRendaExtra !== undefined) setMetaRendaExtra(fo.metaRendaExtra);
                    if (fo.rendaExtraRealizada !== undefined) setRendaExtraRealizada(fo.rendaExtraRealizada);
                    if (fo.despesasFixas !== undefined) setDespesasFixas(fo.despesasFixas);
                    if (fo.mensalidadeEstudos !== undefined) setMensalidadeEstudos(fo.mensalidadeEstudos);
                    if (fo.metaPoupanca !== undefined) setMetaPoupanca(fo.metaPoupanca);
                    if (fo.reservaEmergencia !== undefined) setReservaEmergencia(fo.reservaEmergencia);
                }

                const stats = await api.getDeliveryStats();
                setDeliveryStats(stats);

                const reports = await api.getReports();
                setHistory(Array.isArray(reports) ? reports : []);

                if (stats && stats.profit > 0) {
                    setRendaExtraRealizada(stats.profit.toFixed(2));
                }
            } catch (e) {
                console.error('Failed to load initial data:', e);
            }
            setIsLoaded(true);
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (isLoaded && (!metaPoupanca || metaPoupanca === '3274.51')) {
             setMetaPoupanca('3548.99'); 
        }
    }, [isLoaded]);

    const rFelipe = parseBRLValue(rendaFixaFelipe);
    const rFernanda = parseBRLValue(rendaFixaFernanda);
    const rExtraRealizada = parseBRLValue(rendaExtraRealizada);
    const dFixas = parseBRLValue(despesasFixas);
    const mEstudos = parseBRLValue(mensalidadeEstudos);
    const mPoupanca = parseBRLValue(metaPoupanca || '3548.99');
    const rEmergencia = parseBRLValue(reservaEmergencia);

    const suggestedEducationalFees = debts.reduce((sum, d) => {
        if (!d || d.status === 'quitado') return sum;
        const banco = (d.banco || '').toString().toLowerCase().trim();
        if (banco.includes('uninter') || banco.includes('descomplica')) {
            const valorParcela = parseBRLValue(d.vlrP) || parseBRLValue(d.valor) || 0;
            return sum + valorParcela;
        }
        return sum;
    }, 0);

    const totalReceitas = rFelipe + rFernanda + rExtraRealizada;
    const totalDespesas = dFixas + mPoupanca + rEmergencia + mEstudos; 
    const gap = totalDespesas - totalReceitas;

    useEffect(() => {
        if (!isLoaded) return;
        const delayDebounceFn = setTimeout(() => {
            api.updateSettings({
                financialOverview: {
                    rendaFixaFelipe,
                    rendaFixaFernanda,
                    metaRendaExtra,
                    rendaExtraRealizada,
                    despesasFixas,
                    mensalidadeEstudos,
                    metaPoupanca,
                    reservaEmergencia
                }
            } as any);
        }, 1200);
        return () => clearTimeout(delayDebounceFn);
    }, [rendaFixaFelipe, rendaFixaFernanda, metaRendaExtra, rendaExtraRealizada, despesasFixas, mensalidadeEstudos, metaPoupanca, reservaEmergencia, isLoaded]);

    const handleSaveMonth = async () => {
        const report = {
            totalReceitas,
            totalDespesas,
            gap,
            rendaExtra: rExtraRealizada,
            poupanca: mPoupanca,
            timestamp: new Date().toISOString()
        };
        const success = await api.saveMonth(report);
        if (success) {
            alert('📊 Mês salvo com sucesso no histórico!');
            const reports = await api.getReports();
            setHistory(reports);
        }
    };

    const handleDeleteReport = async (id: string) => {
        if (!window.confirm('🗑️ Deseja remover este registro do histórico?')) return;
        const success = await api.deleteSavedMonth(id);
        if (success) {
            const reports = await api.getReports();
            setHistory(reports);
        }
    };

    return (
        <div className="financial-overview-container-v4">
            <header className="financial-overview-header">
                <h1>Visão Financeira Digital</h1>
                <p>Gestão de fluxo de caixa e integração com plataforma de entregas</p>
            </header>

            <div className="financial-overview-layout">
                {}
                <div className="financial-card-stack">
                    <div className="financial-card">
                        <div className="financial-card-header">📈 Receitas</div>
                        <div className="financial-input-group">
                            <label>Renda Fixa (Felipe)</label>
                            <div className="financial-input-wrapper">
                                <span className="financial-input-prefix">R$</span>
                                <input type="number" value={rendaFixaFelipe} step="0.01" onChange={(e) => setRendaFixaFelipe(e.target.value)}/>
                            </div>
                        </div>
                        <div className="financial-input-group">
                            <label>Renda Fixa (Fernanda)</label>
                            <div className="financial-input-wrapper">
                                <span className="financial-input-prefix">R$</span>
                                <input type="number" value={rendaFixaFernanda} step="0.01" onChange={(e) => setRendaFixaFernanda(e.target.value)}/>
                            </div>
                        </div>
                        <div className="financial-input-group">
                            <label>Meta de Renda Extra</label>
                            <div className="financial-input-wrapper">
                                <span className="financial-input-prefix">R$</span>
                                <input type="number" value={metaRendaExtra} step="0.01" onChange={(e) => setMetaRendaExtra(e.target.value)}/>
                            </div>
                        </div>
                        <div className="financial-input-group">
                            <label>Renda Extra Realizada</label>
                            <div className="financial-input-wrapper">
                                <span className="financial-input-prefix">R$</span>
                                <input type="number" value={rendaExtraRealizada} step="0.01" onChange={(e) => setRendaExtraRealizada(e.target.value)}/>
                            </div>
                            <span className="financial-helper-text">Puxado automaticamente das entregas</span>
                        </div>
                    </div>

                    {}
                    <div className="financial-card mini-card-income">
                        <div className="financial-card-header" style={{fontSize: '0.9rem', color: '#10b981'}}>💰 Renda Extra Acumulada (Total)</div>
                        <div className="sidebar-value" style={{color: '#10b981', fontSize: '1.4rem', fontWeight: 900, textAlign: 'center', marginTop: '10px'}}>
                            {formatBRL(deliveryStats.totalProfitAllTime || 0)}
                        </div>
                        <p style={{fontSize: '0.7rem', color: '#64748b', textAlign: 'center', marginTop: '5px'}}>
                            Soma de todos os meses registrados no sistema
                        </p>
                    </div>
                </div>

                {}
                <div className="financial-card-stack">
                    <div className="financial-card">
                        <div className="financial-card-header">📉 Despesas e Metas</div>
                        <div className="financial-input-group">
                            <label>Custo Fixo de Vida</label>
                            <div className="financial-input-wrapper">
                                <span className="financial-input-prefix">R$</span>
                                <input type="number" value={despesasFixas} step="0.01" onChange={(e) => setDespesasFixas(e.target.value)}/>
                            </div>
                        </div>
                        <div className="financial-input-group">
                            <label>
                                Mensalidades (Estudos)
                                {suggestedEducationalFees > 0 && suggestedEducationalFees !== mEstudos && (
                                    <button className="financial-sync-btn" onClick={() => setMensalidadeEstudos(suggestedEducationalFees.toString())}>🔄 Sugerir ({formatBRL(suggestedEducationalFees)})</button>
                                )}
                            </label>
                            <div className="financial-input-wrapper">
                                <span className="financial-input-prefix">R$</span>
                                <input type="number" value={mensalidadeEstudos} step="0.01" onChange={(e) => setMensalidadeEstudos(e.target.value)}/>
                            </div>
                        </div>
                        <div className="financial-input-group">
                            <label>
                                Meta Mensal de Poupança
                                <button className="financial-sync-btn" onClick={() => setMetaPoupanca(calculatedMonthlyGoal)}>🔄 Sincronizar ({formatBRL(parseFloat(calculatedMonthlyGoal))})</button>
                            </label>
                            <div className="financial-input-wrapper">
                                <span className="financial-input-prefix">R$</span>
                                <input type="number" value={metaPoupanca || calculatedMonthlyGoal} step="0.01" onChange={(e) => setMetaPoupanca(e.target.value)}/>
                            </div>
                        </div>
                        <div className="financial-input-group">
                            <label>Reserva de Emergência</label>
                            <div className="financial-input-wrapper">
                                <span className="financial-input-prefix">R$</span>
                                <input type="number" value={reservaEmergencia} step="0.01" onChange={(e) => setReservaEmergencia(e.target.value)}/>
                            </div>
                        </div>
                    </div>

                    {}
                    <div className="financial-card delivery-integration-card">
                        <div className="financial-card-header">🛵 Resumo de Entregas (Mês)</div>
                        <div className="delivery-stats-grid">
                            <div className="delivery-stat-item">
                                <span className="stat-label">Rodado</span>
                                <span className="stat-value">{deliveryStats.km.toFixed(1)} km</span>
                            </div>
                            <div className="delivery-stat-item">
                                <span className="stat-label">Bruto</span>
                                <span className="stat-value" style={{color: '#10b981'}}>{formatBRL(deliveryStats.ganhosBrutos)}</span>
                            </div>
                            <div className="delivery-stat-item">
                                <span className="stat-label">Gasolina</span>
                                <span className="stat-value" style={{color: '#ef4444'}}>{formatBRL(deliveryStats.gasolina)}</span>
                            </div>
                            <div className="delivery-stat-item">
                                <span className="stat-label">Lucro Líquido</span>
                                <span className="stat-value" style={{color: '#3b82f6', fontWeight: 900}}>{formatBRL(deliveryStats.profit)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {}
                <div className="financial-summary-sidebar">
                    <div className="summary-card-sidebar income">
                        <span className="sidebar-label">Renda Total</span>
                        <div className="sidebar-value" style={{color: '#10b981'}}>R$ {formatBRL(totalReceitas)}</div>
                    </div>
                    <div className="summary-card-sidebar total">
                        <span className="sidebar-label">Total Necessário</span>
                        <div className="sidebar-value" style={{color: '#3b82f6'}}>R$ {formatBRL(totalDespesas)}</div>
                    </div>
                    <div className="summary-card-sidebar daily-target" style={{ borderLeft: '4px solid #f59e0b', background: 'rgba(245, 158, 11, 0.05)' }}>
                        <span className="sidebar-label">Meta Diária (30 dias)</span>
                        <div className="sidebar-value" style={{color: '#f59e0b'}}>R$ {formatBRL(totalDespesas / 30)}</div>
                    </div>
                    <div className={`summary-card-sidebar ${gap > 0 ? 'deficit' : 'surplus'}`}>
                        <span className="sidebar-label">{gap > 0 ? 'Ficou Negativo em' : 'Sobra Aberta'}</span>
                        <div className="sidebar-value" style={{color: gap > 0 ? '#ef4444' : '#10b981'}}>
                            {gap > 0 ? `- R$ ${formatBRL(Math.abs(gap))}` : `+ R$ ${formatBRL(Math.abs(gap))}`}
                        </div>
                    </div>

                    <div className="financial-actions-sidebar">
                        <button className="save-month-btn" onClick={handleSaveMonth}>💾 Salvar Mês</button>
                        <button className="export-csv-btn" onClick={() => api.exportReportsCSV()}>📊 Exportar Excel</button>
                    </div>

                    <div className="financial-meal-card-info-sidebar">
                        💡 Alimentação (Cartão Refeição R$ 850,00) não contabilizado acima.
                    </div>
                </div>
            </div>

            {}
            {history.length > 0 && (
                <div className="financial-history-section">
                    <h2 className="history-title">🗓️ Histórico de Fechamentos Mensais</h2>
                    <div className="history-grid-v4">
                        {history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((item) => (
                            <div key={item.id} className="history-card-v4">
                                <div className="history-card-date">
                                    {new Date(item.date).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                                </div>
                                <div className="history-stats">
                                    <div className="hist-stat">
                                        <span className="hist-label">Renda</span>
                                        <span className="hist-value positive">R$ {formatBRL(item.data.totalReceitas)}</span>
                                    </div>
                                    <div className="hist-stat">
                                        <span className="hist-label">Despesa</span>
                                        <span className="hist-value negative">R$ {formatBRL(item.data.totalDespesas)}</span>
                                    </div>
                                    <div className="hist-stat">
                                        <span className="hist-label">Balanço</span>
                                        <span className={`hist-value ${item.data.gap > 0 ? 'negative' : 'positive'}`}>
                                            R$ {formatBRL(Math.abs(item.data.gap))} {item.data.gap > 0 ? '(Falta)' : '(Sobra)'}
                                        </span>
                                    </div>
                                </div>
                                <button className="delete-report-btn" onClick={() => handleDeleteReport(item.id)}>Remover</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FinancialOverview;
