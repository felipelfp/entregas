import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import './DeliveryTracker.css';

const getLocalDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

interface DeliveryTrackerProps {
    onRefresh?: () => void;
}

const DeliveryTracker: React.FC<DeliveryTrackerProps> = ({ onRefresh }) => {
    const [history, setHistory] = useState<any[]>([]);
    const [today, setToday] = useState<any>({
        id: null,
        data: getLocalDateString(),
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

            const activeRecord = hist.find((r: any) => !r.saida || r.saida === '');

            if (activeRecord) {
                const savedDraft = localStorage.getItem(`delivery_draft_${activeRecord.id}`);
                if (savedDraft) {
                    try {
                        const parsedDraft = JSON.parse(savedDraft);
                        if (parsedDraft.id === activeRecord.id) {
                            setToday({ ...activeRecord, ...parsedDraft });
                            setIsLoading(false);
                            return;
                        }
                    } catch (e) {
                        console.error("Erro ao carregar rascunho local:", e);
                    }
                }
                setToday(activeRecord);
            } else {
                const todayStr = getLocalDateString();
                const closedToday = hist.find((r: any) => r.data === todayStr && r.saida && r.saida !== '');
                if (closedToday) {
                    setToday(closedToday);
                } else {
                    startNewSession();
                }
            }
        } catch (e) {
            console.error("Erro ao carregar entregas:", e);
        }
        setIsLoading(false);
    };

    const startNewSession = () => {
        if (today && today.id) {
            localStorage.removeItem(`delivery_draft_${today.id}`);
        }
        setToday({
            id: null,
            data: getLocalDateString(),
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

    useEffect(() => {
        if (today && today.id) {
            localStorage.setItem(`delivery_draft_${today.id}`, JSON.stringify(today));
        }
    }, [today]);

    const handleSave = async (updatedFields: any, silent: boolean = false) => {
        const recordToSave = { ...today, ...updatedFields };
        setToday(recordToSave);
        if (recordToSave.id || updatedFields.entrada) {
            const success = await api.saveDeliveryRecord(recordToSave);
            if (success) {
                await loadData();
                if (onRefresh) onRefresh();
            } else {
                if (!silent) {
                    alert("❌ Erro ao salvar. Verifique a conexão com o servidor.");
                }
            }
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

    const getLucroClass = (val: number) => {
        if (val < 225) return "neg-val"; // red
        if (val === 225) return "warn-val"; // yellow
        return "pos-val"; // green
    };

    const currentKmRodados = today.km_final > today.km_inicial ? today.km_final - today.km_inicial : 0;
    const currentLucro = (Number(today.ganhos) || 0) - ((Number(today.gasolina) || 0) + (Number(today.manutencao) || 0) + (Number(today.antecipacao) || 0));

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
                                onBlur={() => handleSave({}, true)}
                            />
                        </div>
                        <div className="input-row">
                            <input 
                                type="number" 
                                placeholder="KM Final" 
                                value={today.km_final || ''} 
                                onChange={(e) => handleInputChange('km_final', e.target.value)}
                                onBlur={() => handleSave({}, true)}
                            />
                            <button onClick={() => handleSave({})}>OK</button>
                        </div>
                        {currentKmRodados > 0 && <p style={{fontSize: '0.75rem', color: '#3b82f6'}}>Rodados: {currentKmRodados.toFixed(1)} km</p>}
                    </div>

                    <div className="control-card">
                        <h3>💰 Ganhos e Custos</h3>
                        <div className="input-group-label">Ganhos</div>
                        <div className="input-row">
                            <input type="number" placeholder="Ganhos R$" value={today.ganhos || ''} onChange={(e) => handleInputChange('ganhos', e.target.value)} onBlur={() => handleSave({}, true)}/>
                        </div>
                        <div className="input-group-label">Gasolina</div>
                        <div className="input-row">
                            <input type="number" placeholder="Gasolina R$" value={today.gasolina || ''} onChange={(e) => handleInputChange('gasolina', e.target.value)} onBlur={() => handleSave({}, true)}/>
                        </div>
                        <div className="input-group-label">Manutenção</div>
                        <div className="input-row">
                            <input type="number" placeholder="Manutenção R$" value={today.manutencao || ''} onChange={(e) => handleInputChange('manutencao', e.target.value)} onBlur={() => handleSave({}, true)}/>
                        </div>
                        <div className="input-group-label">Antecipação</div>
                        <div className="input-row">
                            <input type="number" placeholder="Antecipação R$" value={today.antecipacao || ''} onChange={(e) => handleInputChange('antecipacao', e.target.value)} onBlur={() => handleSave({}, true)}/>
                        </div>
                        <button className="ponto-btn" onClick={() => handleSave({})} style={{background: '#3b82f6', color: 'white', width: '100%', marginTop: '1rem'}}>💾 Salvar Registros</button>
                    </div>

                    {today.entrada && (
                        <div className="control-card">
                            <h3 style={{color: '#eab308'}}>🎯 Meta Diária (R$ 225,00)</h3>
                            <div style={{display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '0.5rem'}}>
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                    <span style={{fontSize: '0.75rem', color: '#94a3b8'}}>Lucro Estimado:</span>
                                    <span className={getLucroClass(currentLucro)} style={{fontSize: '0.95rem', fontFamily: 'JetBrains Mono, monospace'}}>
                                        {formatBRL(currentLucro)}
                                    </span>
                                </div>
                                <div style={{
                                    fontSize: '0.75rem',
                                    padding: '6px 10px',
                                    borderRadius: '6px',
                                    textAlign: 'center',
                                    fontWeight: 'bold',
                                    background: currentLucro < 225 ? 'rgba(239, 68, 68, 0.15)' : currentLucro === 225 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                                    color: currentLucro < 225 ? '#ef4444' : currentLucro === 225 ? '#f59e0b' : '#10b981',
                                    border: currentLucro < 225 ? '1px solid rgba(239, 68, 68, 0.3)' : currentLucro === 225 ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)'
                                }}>
                                    {currentLucro < 225 
                                        ? `Faltam ${formatBRL(225 - currentLucro)} para bater a meta` 
                                        : currentLucro === 225 
                                            ? 'Meta atingida exatamente!' 
                                            : `Meta superada em ${formatBRL(currentLucro - 225)}! 🚀`
                                    }
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {}
                <div className="delivery-dashboard">
                    <div className="stats-bar">
                        <div className="stat-box">
                            <span className="stat-label">Km Total (Mês)</span>
                            <span className="stat-value">{history.reduce((s, r) => s + (Number(r.km_final) - Number(r.km_inicial) > 0 ? Number(r.km_final) - Number(r.km_inicial) : 0), 0).toFixed(1)}</span>
                        </div>
                        <div className="stat-box">
                            <span className="stat-label">Ganhos (Mês)</span>
                            <span className="stat-value" style={{color: '#10b981'}}>{formatBRL(history.reduce((s, r) => s + (Number(r.ganhos) || 0), 0))}</span>
                        </div>
                        <div className="stat-box">
                            <span className="stat-label">Gastos (Mês)</span>
                            <span className="stat-value" style={{color: '#ef4444'}}>{formatBRL(history.reduce((s, r) => s + (Number(r.gasolina) || 0) + (Number(r.manutencao) || 0) + (Number(r.antecipacao) || 0), 0))}</span>
                        </div>
                        <div className="stat-box">
                            <span className="stat-label">Lucro Líquido</span>
                            {(() => {
                                const totalLucroMes = history.reduce((s, r) => {
                                    const ganhos = Number(r.ganhos) || 0;
                                    const gastos = (Number(r.gasolina) || 0) + (Number(r.manutencao) || 0) + (Number(r.antecipacao) || 0);
                                    return s + (ganhos - gastos);
                                }, 0);
                                const diasTrabalhados = history.length;
                                const metaDias = 225 * diasTrabalhados;
                                const diff = totalLucroMes - metaDias;
                                return (
                                    <>
                                        <span className="stat-value" style={{color: '#3b82f6'}}>{formatBRL(totalLucroMes)}</span>
                                        {diasTrabalhados > 0 && (
                                            <span style={{
                                                fontSize: '0.65rem',
                                                fontWeight: 800,
                                                marginTop: '4px',
                                                display: 'block',
                                                color: diff < 0 ? '#ef4444' : diff === 0 ? '#eab308' : '#10b981'
                                            }}>
                                                {diff < 0
                                                    ? `⬇ Faltou ${formatBRL(Math.abs(diff))} no mês`
                                                    : diff === 0
                                                        ? `✓ Meta do mês exata!`
                                                        : `⬆ Passou ${formatBRL(diff)} no mês`
                                                }
                                            </span>
                                        )}
                                    </>
                                );
                            })()}
                        </div>

                        {/* Card Meta do Mês */}
                        {(() => {
                            const META_MES = 225 * 30; // R$ 6.750,00
                            const totalLucroMes = history.reduce((s, r) => {
                                const ganhos = Number(r.ganhos) || 0;
                                const gastos = (Number(r.gasolina) || 0) + (Number(r.manutencao) || 0) + (Number(r.antecipacao) || 0);
                                return s + (ganhos - gastos);
                            }, 0);
                            const progresso = Math.min((totalLucroMes / META_MES) * 100, 100);
                            const falta = META_MES - totalLucroMes;
                            const passou = totalLucroMes - META_MES;
                            const cor = totalLucroMes >= META_MES ? '#10b981' : totalLucroMes >= META_MES * 0.7 ? '#eab308' : '#ef4444';
                            return (
                                <div className="stat-box" style={{
                                    background: 'rgba(59,130,246,0.07)',
                                    border: '1px solid rgba(59,130,246,0.2)',
                                    minWidth: '160px'
                                }}>
                                    <span className="stat-label" style={{color: '#3b82f6'}}>🎯 Meta do Mês</span>
                                    <span className="stat-value" style={{color: '#ffffff', fontSize: '1rem'}}>{formatBRL(META_MES)}</span>
                                    <span style={{fontSize: '0.65rem', color: '#94a3b8', display: 'block', marginTop: '2px'}}>
                                        R$ 225 × 30 dias
                                    </span>

                                    {/* Barra de progresso */}
                                    <div style={{
                                        background: 'rgba(255,255,255,0.08)',
                                        borderRadius: '4px',
                                        height: '5px',
                                        margin: '6px 0',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            width: `${progresso}%`,
                                            height: '100%',
                                            background: cor,
                                            borderRadius: '4px',
                                            transition: 'width 0.5s ease'
                                        }} />
                                    </div>

                                    <span style={{fontSize: '0.65rem', fontWeight: 800, color: cor, display: 'block'}}>
                                        {totalLucroMes >= META_MES
                                            ? `✅ Passou ${formatBRL(passou)}!`
                                            : `⬇ Falta ${formatBRL(falta)} (${progresso.toFixed(0)}%)`
                                        }
                                    </span>
                                </div>
                            );
                        })()}

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
                                                <td className={getLucroClass(lucro)}>
                                                    {formatBRL(lucro)}
                                                    {(() => {
                                                        const diff = lucro - 225;
                                                        if (diff < 0) return <span style={{fontSize: '0.6rem', display: 'block', color: '#ef4444', fontWeight: 800}}>⬇ Faltou {formatBRL(Math.abs(diff))}</span>;
                                                        if (diff === 0) return <span style={{fontSize: '0.6rem', display: 'block', color: '#eab308', fontWeight: 800}}>✓ Meta exata</span>;
                                                        return <span style={{fontSize: '0.6rem', display: 'block', color: '#10b981', fontWeight: 800}}>⬆ Passou {formatBRL(diff)}</span>;
                                                    })()}
                                                </td>
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
                                            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end'}}>
                                                <span className={`item-value ${getLucroClass(lucro)}`}>{formatBRL(lucro)}</span>
                                                {(() => {
                                                    const diff = lucro - 225;
                                                    if (diff < 0) return <span style={{fontSize: '0.65rem', color: '#ef4444', fontWeight: 800}}>⬇ Faltou {formatBRL(Math.abs(diff))}</span>;
                                                    if (diff === 0) return <span style={{fontSize: '0.65rem', color: '#eab308', fontWeight: 800}}>✓ Meta exata</span>;
                                                    return <span style={{fontSize: '0.65rem', color: '#10b981', fontWeight: 800}}>⬆ Passou {formatBRL(diff)}</span>;
                                                })()}
                                            </div>
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
