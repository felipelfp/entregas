import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import './DeliveryTracker.css';

interface DeliveryTrackerProps {
    onRefresh?: () => void;
}

const DeliveryTracker: React.FC<DeliveryTrackerProps> = ({ onRefresh }) => {
    const [history, setHistory] = useState<any[]>([]);
    const [today, setToday] = useState<any>({
        id: null,
        data: new Date().toISOString().split('T')[0],
        entrada: '',
        saida: '',
        km_inicial: 0,
        km_final: 0,
        ganhos: 0,
        gasolina: 0,
        manutencao: 0,
        antecipacao: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    const formatBRL = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const loadData = async () => {
        setIsLoading(true);
        try {
            const hist = await api.getDeliveryHistory();
            setHistory(hist);

            const todayStr = new Date().toISOString().split('T')[0];
            const activeRecord = hist.find((r: any) => r.data === todayStr && (!r.saida || r.saida === ''));

            if (activeRecord) {
                setToday(activeRecord);
            } else {
                startNewSession();
            }
        } catch (e) {
            console.error("Erro ao carregar entregas:", e);
        }
        setIsLoading(false);
    };

    const startNewSession = () => {
        setToday({
            id: null,
            data: new Date().toISOString().split('T')[0],
            entrada: '',
            saida: '',
            km_inicial: 0,
            km_final: 0,
            ganhos: 0,
            gasolina: 0,
            manutencao: 0,
            antecipacao: 0
        });
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSave = async (updatedFields: any) => {
        const recordToSave = { ...today, ...updatedFields };
        setToday(recordToSave);
        const success = await api.saveDeliveryRecord(recordToSave);
        if (success) {
            await loadData();
            if (onRefresh) onRefresh();
        } else {
            alert("❌ Erro ao salvar. Verifique a conexão com o servidor.");
        }
    };

    const registerEntry = () => {
        const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        handleSave({ entrada: time });
    };

    const registerExit = () => {

        if (!today.entrada) {
            alert("⚠️ Erro: Não foi encontrado o horário de Entrada! Registre a entrada antes de encerrar.");
            return;
        }
        if (!today.km_inicial || today.km_inicial <= 0) {
            alert("⚠️ Campo Obrigatório: Por favor, informe o KM Inicial antes de fechar o expediente!");
            return;
        }
        if (!today.km_final || today.km_final <= 0) {
            alert("⚠️ Campo Obrigatório: Por favor, informe o KM Final antes de fechar o expediente!");
            return;
        }
        if (Number(today.km_final) <= Number(today.km_inicial)) {
            alert("⚠️ Inconsistência de KM: O KM Final deve ser maior do que o KM Inicial!");
            return;
        }
        if (!today.ganhos || today.ganhos <= 0) {
            alert("⚠️ Campo Obrigatório: Por favor, informe os seus Ganhos (R$) do dia antes de fechar!");
            return;
        }
        if (today.gasolina === undefined || today.gasolina === null || today.gasolina < 0) {
            alert("⚠️ Campo Obrigatório: Por favor, informe o gasto com Gasolina (R$) (digite 0 se não abasteceu hoje)!");
            return;
        }

        const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        handleSave({ saida: time });
    };

    const handleInputChange = (field: string, value: string) => {

        const sanitizedValue = value.replace(',', '.');
        const numValue = sanitizedValue === '' ? 0 : parseFloat(sanitizedValue);
        setToday((prev: any) => ({ ...prev, [field]: numValue }));
    };

    const currentKmRodados = today.km_final > today.km_inicial ? today.km_final - today.km_inicial : 0;
    const currentLucro = today.ganhos - (today.gasolina + today.manutencao + today.antecipacao);

    const handleDeleteRecord = async (id: string) => {
        if (!window.confirm(`⚠️ Tem certeza que deseja remover este registro?`)) return;
        const success = await api.deleteDeliveryRecord(id);
        if (success) {
            await loadData();
            if (onRefresh) onRefresh();
        } else {
            alert("❌ Erro ao deletar registro.");
        }
    };

    return (
        <div className="delivery-tracker-container">
            <header className="delivery-header">
                <div className="delivery-title-group">
                    <h1>Gerenciamento de Entregas</h1>
                    <p style={{color: '#64748b', fontSize: '0.9rem', marginTop: '4px'}}>
                        Controle de rotas, combustível e lucratividade operacional
                    </p>
                </div>
                <div className={`status-badge ${today.entrada && !today.saida ? 'status-working' : 'status-off'}`}>
                    {today.entrada && !today.saida ? '🟡 Em Rota' : '⚪ Fora de Expediente'}
                </div>
            </header>

            <div className="delivery-grid">
                {}
                <div className="delivery-controls">
                    <div className="control-card">
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
                            <h3 style={{margin: 0}}>🕒 Registro de Ponto</h3>
                            {today.saida && (
                                <button onClick={startNewSession} className="mini-btn-new">Novo</button>
                            )}
                        </div>
                        <div className="action-buttons-group">
                            {!today.entrada ? (
                                <button className="ponto-btn btn-entrada" onClick={registerEntry}>Registrar Entrada</button>
                            ) : !today.saida ? (
                                <button className="ponto-btn btn-saida" onClick={registerExit}>Registrar Saída</button>
                            ) : (
                                <div style={{width: '100%', textAlign: 'center'}}>
                                    <div style={{fontSize: '0.8rem', color: '#94a3b8', marginBottom: '8px'}}>
                                        Expediente Encerrado ({today.entrada} - {today.saida})
                                    </div>
                                    <button className="ponto-btn btn-nova-sessao" onClick={startNewSession} style={{fontSize: '0.8rem', padding: '6px'}}>
                                        Iniciar Novo Turno
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="control-card">
                        <h3>🚗 Registro de KM</h3>
                        <div className="input-row">
                            <input 
                                type="number" 
                                placeholder="KM Inicial" 
                                value={today.km_inicial || ''} 
                                onChange={(e) => handleInputChange('km_inicial', e.target.value)}
                            />
                        </div>
                        <div className="input-row">
                            <input 
                                type="number" 
                                placeholder="KM Final" 
                                value={today.km_final || ''} 
                                onChange={(e) => handleInputChange('km_final', e.target.value)}
                            />
                            <button onClick={() => handleSave({})}>OK</button>
                        </div>
                        {currentKmRodados > 0 && <p style={{fontSize: '0.75rem', color: '#3b82f6'}}>Rodados: {currentKmRodados.toFixed(1)} km</p>}
                    </div>

                    <div className="control-card">
                        <h3>💰 Ganhos e Custos</h3>
                        <div className="input-group-label">Ganhos</div>
                        <div className="input-row">
                            <input type="number" placeholder="Ganhos R$" value={today.ganhos || ''} onChange={(e) => handleInputChange('ganhos', e.target.value)}/>
                        </div>
                        <div className="input-group-label">Gasolina</div>
                        <div className="input-row">
                            <input type="number" placeholder="Gasolina R$" value={today.gasolina || ''} onChange={(e) => handleInputChange('gasolina', e.target.value)}/>
                        </div>
                        <div className="input-group-label">Manutenção</div>
                        <div className="input-row">
                            <input type="number" placeholder="Manutenção R$" value={today.manutencao || ''} onChange={(e) => handleInputChange('manutencao', e.target.value)}/>
                        </div>
                        <div className="input-group-label">Antecipação</div>
                        <div className="input-row">
                            <input type="number" placeholder="Antecipação R$" value={today.antecipacao || ''} onChange={(e) => handleInputChange('antecipacao', e.target.value)}/>
                        </div>
                        <button className="ponto-btn" onClick={() => handleSave({})} style={{background: '#3b82f6', color: 'white', width: '100%', marginTop: '1rem'}}>💾 Salvar Registros</button>
                    </div>
                </div>

                {}
                <div className="delivery-dashboard">
                    <div className="stats-bar">
                        <div className="stat-box">
                            <span className="stat-label">Km Total (Mês)</span>
                            <span className="stat-value">{history.reduce((s, r) => s + (r.km_final - r.km_inicial > 0 ? r.km_final - r.km_inicial : 0), 0).toFixed(1)}</span>
                        </div>
                        <div className="stat-box">
                            <span className="stat-label">Ganhos (Mês)</span>
                            <span className="stat-value" style={{color: '#10b981'}}>{formatBRL(history.reduce((s, r) => s + r.ganhos, 0))}</span>
                        </div>
                        <div className="stat-box">
                            <span className="stat-label">Gastos (Mês)</span>
                            <span className="stat-value" style={{color: '#ef4444'}}>{formatBRL(history.reduce((s, r) => s + r.gasolina + r.manutencao, 0))}</span>
                        </div>
                        <div className="stat-box">
                            <span className="stat-label">Lucro Líquido</span>
                            <span className="stat-value" style={{color: '#3b82f6'}}>{formatBRL(history.reduce((s, r) => s + (r.ganhos - (r.gasolina + r.manutencao + r.antecipacao)), 0))}</span>
                        </div>
                    </div>

                    <div className="history-card">
                        <h3>🗓️ Histórico Recente</h3>
                        
                        {/* Desktop Table View */}
                        <div className="history-table-wrapper">
                            <table className="history-table">
                                <thead>
                                    <tr>
                                        <th>Data</th>
                                        <th>Ponto</th>
                                        <th>KM</th>
                                        <th>Ganhos</th>
                                        <th>Gasolina</th>
                                        <th>Manut.</th>
                                        <th>Antecip.</th>
                                        <th>Lucro</th>
                                        <th>Ação</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map((record, i) => {
                                        const km = (record.km_final || 0) - (record.km_inicial || 0) > 0 ? (record.km_final || 0) - (record.km_inicial || 0) : 0;
                                        const lucro = (record.ganhos || 0) - ((record.gasolina || 0) + (record.manutencao || 0) + (record.antecipacao || 0));
                                        const dataFormatada = record.data && typeof record.data === 'string' ? record.data.split('-').reverse().join('/') : '--';
                                        return (
                                            <tr key={record.id || i}>
                                                <td>{dataFormatada}</td>
                                                <td>{record.entrada || '--'} - {record.saida || '--'}</td>
                                                <td>{km.toFixed(1)} km</td>
                                                <td className="pos-val">{formatBRL(record.ganhos || 0)}</td>
                                                <td className="neg-val">{formatBRL(record.gasolina || 0)}</td>
                                                <td className="neg-val">{formatBRL(record.manutencao || 0)}</td>
                                                <td className="neg-val">{formatBRL(record.antecipacao || 0)}</td>
                                                <td className={lucro >= 0 ? "pos-val" : "neg-val"}>{formatBRL(lucro)}</td>
                                                <td style={{textAlign: 'center'}}>
                                                    <button 
                                                        className="delete-history-btn"
                                                        onClick={() => handleDeleteRecord(record.id || record.data)}
                                                        title="Remover do histórico"
                                                    >
                                                        🗑️
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards View */}
                        <div className="history-cards-wrapper">
                            {history.map((record, i) => {
                                const km = (record.km_final || 0) - (record.km_inicial || 0) > 0 ? (record.km_final || 0) - (record.km_inicial || 0) : 0;
                                const lucro = (record.ganhos || 0) - ((record.gasolina || 0) + (record.manutencao || 0) + (record.antecipacao || 0));
                                const dataFormatada = record.data && typeof record.data === 'string' ? record.data.split('-').reverse().join('/') : '--';
                                return (
                                    <div key={record.id || i} className="history-mobile-card">
                                        <div className="card-header">
                                            <span className="card-date">📅 {dataFormatada}</span>
                                            <button 
                                                className="delete-history-btn"
                                                onClick={() => handleDeleteRecord(record.id || record.data)}
                                                title="Remover do histórico"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                        <div className="card-body-list">
                                            <div className="card-body-item">
                                                <span className="item-label">⏱️ Turno</span>
                                                <span className="item-value">{record.entrada || '--'} - {record.saida || '--'}</span>
                                            </div>
                                            <div className="card-body-item">
                                                <span className="item-label">🚗 KM Rodados</span>
                                                <span className="item-value">{km.toFixed(1)} km</span>
                                            </div>
                                            <div className="card-body-item">
                                                <span className="item-label">💰 Ganhos</span>
                                                <span className="item-value pos-val">{formatBRL(record.ganhos || 0)}</span>
                                            </div>
                                            <div className="card-body-item">
                                                <span className="item-label">⛽ Gasolina</span>
                                                <span className="item-value neg-val">{formatBRL(record.gasolina || 0)}</span>
                                            </div>
                                            <div className="card-body-item">
                                                <span className="item-label">🔧 Manutenção</span>
                                                <span className="item-value neg-val">{formatBRL(record.manutencao || 0)}</span>
                                            </div>
                                            <div className="card-body-item">
                                                <span className="item-label">💸 Antecipação</span>
                                                <span className="item-value neg-val">{formatBRL(record.antecipacao || 0)}</span>
                                            </div>
                                        </div>
                                        <div className="card-footer-lucro">
                                            <span className="item-label">Lucro Líquido:</span>
                                            <span className={`item-value ${lucro >= 0 ? "pos-val" : "neg-val"}`}>{formatBRL(lucro)}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeliveryTracker;
