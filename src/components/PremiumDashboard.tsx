import React, { useState, useEffect, useMemo } from 'react';
import './PremiumDashboard.css';

const PremiumDashboard: React.FC<any> = ({ debts = [], tasks = [], onAdd, onUpdate, onRemove, onScheduleTask }) => {

    const [localDebts, setLocalDebts] = useState<any[]>(Array.isArray(debts) ? debts : []);
    const [filtro, setFiltro] = useState('Todos');
    const [searchTerm, setSearchTerm] = useState('');
    const [current, setCurrent] = useState(0);
    const [newDebt, setNewDebt] = useState({ titular: 'Felipe', banco: '', valorOriginal: '', tipo: 'avista', propostaAvista: '', entrada: '', qtd: '1', vlrParcela: '', vencimento: '5' });
    const [isSaving, setIsSaving] = useState(false);

    const formatBRLDisplay = (val: any) => {
        if (val === undefined || val === null || val === '') return '';
        const num = typeof val === 'number' ? val : parseFloat(String(val).replace(/\./g, '').replace(',', '.')) || 0;
        return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const formatBRLInput = (value: string) => {
        let clean = value.replace(/[^0-9,]/g, '');
        const parts = clean.split(',');
        if (parts.length > 2) {
            clean = parts[0] + ',' + parts.slice(1).join('');
        }
        if (parts.length === 2 && parts[1].length > 2) {
            clean = parts[0] + ',' + parts[1].substring(0, 2);
        }
        return clean;
    };

    const parseBRLValue = (value: string | number): number => {
        if (typeof value === 'number') return value;
        if (!value) return 0;
        const withoutDots = String(value).replace(/\./g, '');
        const withDot = withoutDots.replace(',', '.');
        return parseFloat(withDot) || 0;
    };

    const fmt = useMemo(() => new Intl.NumberFormat('pt-BR', { 
        style: 'currency', 
        currency: 'BRL',
        minimumFractionDigits: 2 
    }), []);

    useEffect(() => {
        if (Array.isArray(debts)) {
            const formatted = debts.map(d => ({
                ...d,
                valor: formatBRLDisplay(d.valor),
                vlrP: formatBRLDisplay(d.vlrP),
                entrada: formatBRLDisplay(d.entrada)
            }));
            setLocalDebts(formatted);
        }
    }, [debts]);

    useEffect(() => {
        setCurrent(0);
    }, [filtro]);

    const listaFiltrada = useMemo(() => {
        if (!Array.isArray(localDebts)) return [];
        return localDebts.filter(d => {
            if (!d) return false;

            if (filtro !== 'Todos' && d.titular !== filtro) return false;

            if (searchTerm && !d.banco?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
            return true;
        });
    }, [localDebts, filtro, searchTerm]);

    const getPaidCount = (d: any) => {
        if (!d) return 0;
        if (d.parcelasPagas !== undefined) return parseInt(d.parcelasPagas) || 0;
        if (!Array.isArray(tasks)) return 0;
        return tasks.filter((t: any) => t.referenceId == d.id && t.referenceType === 'DEBT' && t.completed).length;
    };

    const totals = useMemo(() => {
        let orig = 0, prop = 0;
        listaFiltrada.forEach(d => {
            if (!d || d.status === 'quitado') return; 
            const v = parseBRLValue(d.valor);
            const vp = parseBRLValue(d.vlrP);
            const qT = parseInt(d.qtd) || 1;
            const qP = getPaidCount(d);
            const qRem = Math.max(0, qT - qP);
            const ent = (d.tipo === 'parcelado' && qP === 0) ? parseBRLValue(d.entrada) : 0;
            orig += v;
            prop += (vp * qRem) + ent;
        });
        return { orig, prop, eco: Math.max(0, orig - prop) };
    }, [listaFiltrada, tasks]);

    const handleSync = async (debt: any) => {
        if (!debt || !debt.id || !onUpdate) return;
        try {
            setIsSaving(true);
            await onUpdate(debt);
            setTimeout(() => setIsSaving(false), 800);
        } catch {
            setIsSaving(false);
        }
    };

    const handleLocalEdit = (id: any, field: string, val: any) => {
        setLocalDebts(prev => prev.map(d => d.id === id ? { ...d, [field]: val } : d));
    };

    const move = (dir: number) => {
        if (listaFiltrada.length <= 1) return;
        setCurrent(prev => {
            const next = (prev + dir + listaFiltrada.length) % listaFiltrada.length;
            return isNaN(next) ? 0 : next;
        });
    };

    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        if (listaFiltrada.length <= 1 || isHovered) return;
        const timer = setInterval(() => {
            setCurrent(prev => {
                const next = (prev + 1) % listaFiltrada.length;
                return isNaN(next) ? 0 : next;
            });
        }, 4000); 
        return () => clearInterval(timer);
    }, [listaFiltrada.length, isHovered]);

    return (
        <div className="premium-dashboard">
            <div className="premium-container">
                <header className="premium-summary">
                    <div className="premium-summary-card">
                        <span className="label">Dívida Original</span>
                        <span className="value" style={{color: '#3b82f6'}}>{fmt.format(totals.orig)}</span>
                    </div>
                    <div className="premium-summary-card">
                        <span className="label">Proposta Atual</span>
                        <span className="value" style={{color: '#f59e0b'}}>{fmt.format(totals.prop)}</span>
                    </div>
                    <div className="premium-summary-card">
                        <span className="label">Economia Estimada</span>
                        <span className="value" style={{color: '#10b981'}}>{fmt.format(totals.eco)}</span>
                    </div>
                </header>

                <div className="premium-panel">
                    <div className="premium-grid-add">
                        <div>
                            <label className="premium-label">Responsável</label>
                            <select className="premium-select" value={newDebt.titular} onChange={e=>setNewDebt({...newDebt, titular: e.target.value})}>
                                <option>Felipe</option><option>Fernanda</option><option>Casa</option>
                            </select>
                        </div>
                        <div>
                            <label className="premium-label">Origem/Banco</label>
                            <input className="premium-input" placeholder="Ex: Bradesco" value={newDebt.banco} onChange={e=>setNewDebt({...newDebt, banco: e.target.value})}/>
                        </div>
                        <div>
                            <label className="premium-label">Condição</label>
                            <select className="premium-select" value={newDebt.tipo || 'avista'} onChange={e=>setNewDebt({...newDebt, tipo: e.target.value})}>
                                <option value="avista">À Vista</option>
                                <option value="parcelado">Parcelado</option>
                            </select>
                        </div>
                        <div>
                            <label className="premium-label">Valor Original (R$)</label>
                            <input className="premium-input" type="text" placeholder="Ex: 20000,00" value={newDebt.valorOriginal} onChange={e=>setNewDebt({...newDebt, valorOriginal: formatBRLInput(e.target.value)})} onBlur={()=>setNewDebt({...newDebt, valorOriginal: formatBRLDisplay(newDebt.valorOriginal)})} maxLength={15}/>
                        </div>

                        {newDebt.tipo === 'avista' ? (
                            <div>
                                <label className="premium-label">Proposta/Acordo (R$)</label>
                                <input className="premium-input" type="text" placeholder="Valor Acordado" value={newDebt.propostaAvista} onChange={e=>setNewDebt({...newDebt, propostaAvista: formatBRLInput(e.target.value)})} onBlur={()=>setNewDebt({...newDebt, propostaAvista: formatBRLDisplay(newDebt.propostaAvista)})} maxLength={15}/>
                            </div>
                        ) : (
                            <>
                                <div>
                                    <label className="premium-label">Entrada (R$)</label>
                                    <input className="premium-input" type="text" placeholder="0,00" value={newDebt.entrada} onChange={e=>setNewDebt({...newDebt, entrada: formatBRLInput(e.target.value)})} onBlur={()=>setNewDebt({...newDebt, entrada: formatBRLDisplay(newDebt.entrada)})} maxLength={15}/>
                                </div>
                                <div>
                                    <label className="premium-label">Qtd. Parcelas</label>
                                    <input className="premium-input" type="number" min="1" value={newDebt.qtd} onChange={e=>setNewDebt({...newDebt, qtd: e.target.value})}/>
                                </div>
                                <div>
                                    <label className="premium-label">Vlr. da Parcela (R$)</label>
                                    <input className="premium-input" type="text" placeholder="0,00" value={newDebt.vlrParcela} onChange={e=>setNewDebt({...newDebt, vlrParcela: formatBRLInput(e.target.value)})} onBlur={()=>setNewDebt({...newDebt, vlrParcela: formatBRLDisplay(newDebt.vlrParcela)})} maxLength={15}/>
                                </div>
                            </>
                        )}

                        <div>
                            <label className="premium-label">Vencimento (Dia)</label>
                            <input className="premium-input" type="number" min="1" max="31" value={newDebt.vencimento} onChange={e=>setNewDebt({...newDebt, vencimento: e.target.value})}/>
                        </div>
                        <button className="premium-btn-primary" onClick={async ()=>{
                            if(!newDebt.banco || !newDebt.valorOriginal || !onAdd) return alert("Informe banco e valor original!");
                            setIsSaving(true);

                            const vTotal = parseBRLValue(newDebt.valorOriginal);
                            const vEnt = newDebt.tipo === 'parcelado' ? parseBRLValue(newDebt.entrada) : 0;
                            const vParc = newDebt.tipo === 'parcelado' ? parseBRLValue(newDebt.vlrParcela) : parseBRLValue(newDebt.propostaAvista);
                            const qParc = newDebt.tipo === 'parcelado' ? (parseInt(newDebt.qtd) || 1) : 1;

                            await onAdd({ 
                                titular: newDebt.titular, 
                                banco: newDebt.banco, 
                                valor: vTotal, 
                                tipo: newDebt.tipo, 
                                vlrP: vParc || vTotal, 
                                entrada: vEnt,
                                qtd: qParc, 
                                status: 'pendente',
                                vencimento: parseInt(newDebt.vencimento) || 5
                            });
                            setNewDebt({ titular: 'Felipe', banco: '', valorOriginal: '', tipo: 'avista', propostaAvista: '', entrada: '', qtd: '1', vlrParcela: '', vencimento: '5' });
                            setIsSaving(false);
                        }}>+ Novo Registro</button>
                    </div>
                </div>

                <div className="premium-search-container">
                    <input 
                        type="text" 
                        placeholder="🔍 Pesquisar por banco..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="premium-search-input"
                    />
                    {searchTerm && (
                        <button 
                            className="premium-search-clear"
                            onClick={() => setSearchTerm('')}
                            title="Limpar pesquisa"
                        >
                            ✕
                        </button>
                    )}
                </div>

                <nav className="premium-filter-group">
                    {['Todos', 'Felipe', 'Fernanda', 'Casa'].map(f => (
                        <button 
                            key={f} 
                            className={`premium-filter-btn ${filtro === f ? 'active' : ''}`} 
                            onClick={()=>setFiltro(f)}
                        >
                            {f}
                        </button>
                    ))}
                </nav>

                <main 
                    className="premium-carousel-wrapper"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    onTouchStart={() => setIsHovered(true)}
                    onTouchEnd={() => setIsHovered(false)}
                >
                    <div className="premium-carousel-container">
                        <div className="premium-carousel-track" style={{ transform: `translateX(-${current * 100}%)` }}>
                            {listaFiltrada.length > 0 ? listaFiltrada.map((d, i) => (
                                <div className="premium-carousel-slide" key={d.id || `d-${i}`}>
                                    <div className="premium-card">
                                        <div className="premium-status-badge" style={{ 
                                            borderColor: d.status==='quitado'?'#10b981':(d.status==='andamento'?'#f59e0b':'#71717a'), 
                                            color: d.status==='quitado'?'#10b981':(d.status==='andamento'?'#f59e0b':'#71717a') 
                                        }}>
                                            {(d.status || 'pendente').toUpperCase()}
                                        </div>

                                        <div className="premium-form-row">
                                            <div>
                                                <label className="premium-label">Responsável</label>
                                                <select className="premium-select" value={d.titular} onChange={e=>{handleLocalEdit(d.id, 'titular', e.target.value); handleSync({...d, titular: e.target.value})}}>
                                                    <option>Felipe</option><option>Fernanda</option><option>Casa</option>
                                                </select>
                                            </div>
                                            <div><label className="premium-label">Banco</label><input className="premium-input" value={d.banco || ''} onChange={e=>handleLocalEdit(d.id, 'banco', e.target.value)} onBlur={()=>handleSync(d)}/></div>
                                        </div>

                                        <div className="premium-form-row">
                                            <div><label className="premium-label">Valor Original (R$)</label><input className="premium-input" type="text" value={localDebts.find(item => item.id === d.id)?.valor ?? ''} onChange={e=>handleLocalEdit(d.id, 'valor', formatBRLInput(e.target.value))} onBlur={()=>{const raw = parseBRLValue(d.valor); handleLocalEdit(d.id, 'valor', formatBRLDisplay(raw)); handleSync({...d, valor: raw})}} maxLength={15} placeholder="0,00"/></div>
                                            <div><label className="premium-label">Condição</label><select className="premium-select" value={d.tipo || 'avista'} onChange={e=>{handleLocalEdit(d.id, 'tipo', e.target.value); handleSync({...d, tipo: e.target.value})}}>
                                                <option value="avista">À Vista</option><option value="parcelado">Parcelado</option>
                                            </select></div>
                                        </div>

                                        <div className="premium-form-row">
                                            <div>
                                                <label className="premium-label">{d.tipo === 'parcelado' ? 'Vlr. Parcela (R$)' : 'Proposta/Acordo (R$)'}</label>
                                                <input className="premium-input" type="text" value={localDebts.find(item => item.id === d.id)?.vlrP ?? ''} onChange={e=>handleLocalEdit(d.id, 'vlrP', formatBRLInput(e.target.value))} onBlur={()=>{const raw = parseBRLValue(d.vlrP); handleLocalEdit(d.id, 'vlrP', formatBRLDisplay(raw)); handleSync({...d, vlrP: raw})}} maxLength={15} placeholder="0,00"/>
                                            </div>
                                            <div>
                                                <label className="premium-label">Parcelas (Pagas / Total)</label>
                                                <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                                                    <div style={{display: 'flex', gap: '2px'}}>
                                                        <button 
                                                            className="premium-btn-counter" 
                                                            onClick={() => { const val = Math.max(0, getPaidCount(d) - 1); handleLocalEdit(d.id, 'parcelasPagas', val); handleSync({...d, parcelasPagas: val}) }}
                                                            title="Diminuir"
                                                        >-</button>
                                                        <input 
                                                            className="premium-input-small" 
                                                            style={{width: '35px', textAlign: 'center', fontWeight: 'bold', color: '#10b981', border: '1px solid #10b981'}}
                                                            value={getPaidCount(d)}
                                                            onChange={e => { const val = parseInt(e.target.value) || 0; handleLocalEdit(d.id, 'parcelasPagas', val); handleSync({...d, parcelasPagas: val}); }}
                                                        />
                                                        <button 
                                                            className="premium-btn-counter"
                                                            onClick={() => { const val = Math.min(parseInt(d.qtd) || 0, getPaidCount(d) + 1); handleLocalEdit(d.id, 'parcelasPagas', val); handleSync({...d, parcelasPagas: val}) }}
                                                            title="Aumentar"
                                                        >+</button>
                                                    </div>
                                                    <span style={{fontSize: '14px', color: '#71717a'}}>/</span>
                                                    <input className="premium-input" style={{width: '50px'}} type="number" value={d.qtd || 1} readOnly={d.tipo==='avista'} onChange={e=>handleLocalEdit(d.id, 'qtd', parseInt(e.target.value) || 1)} onBlur={()=>handleSync(d)}/>
                                                </div>
                                            </div>
                                        </div>

                                        {d.tipo === 'parcelado' && (
                                            <div className="premium-form-row">
                                                <div><label className="premium-label">Entrada (R$)</label><input className="premium-input" type="text" value={localDebts.find(item => item.id === d.id)?.entrada ?? ''} onChange={e=>handleLocalEdit(d.id, 'entrada', formatBRLInput(e.target.value))} onBlur={()=>{const raw = parseBRLValue(d.entrada); handleLocalEdit(d.id, 'entrada', formatBRLDisplay(raw)); handleSync({...d, entrada: raw})}} placeholder="0,00" maxLength={15}/></div>
                                                <div><label className="premium-label">Vencimento (Dia)</label><input className="premium-input" type="number" min="1" max="31" value={d.vencimento || 5} onChange={e=>handleLocalEdit(d.id, 'vencimento', parseInt(e.target.value))} onBlur={()=>handleSync(d)}/></div>
                                            </div>
                                        )}

                                        <div className="premium-eco-label">
                                             Total: {fmt.format(parseBRLValue(d.vlrP) * (parseInt(d.qtd) || 1) + (d.tipo === 'parcelado' ? parseBRLValue(d.entrada) : 0))} | Eco: {fmt.format(parseBRLValue(d.valor) - ((parseBRLValue(d.vlrP) * (parseInt(d.qtd) || 1)) + (d.tipo === 'parcelado' ? parseBRLValue(d.entrada) : 0)))}
                                        </div>

                                        <div className="premium-form-row" style={{alignItems: 'center', marginTop: '5px'}}>
                                            <select className="premium-select" style={{flex: 1}} value={d.status || 'pendente'} onChange={e=>{handleLocalEdit(d.id, 'status', e.target.value); handleSync({...d, status: e.target.value})}}>
                                                <option value="pendente">Pendente</option><option value="andamento">Negociação</option><option value="quitado">Quitado</option>
                                            </select>
                                            {onScheduleTask && <button style={{background: 'none', border: 'none', color: '#3498db', cursor: 'pointer', fontSize: '13px', marginLeft: '5px'}} onClick={()=>onScheduleTask({title: `Conta: ${d.banco} - ${d.titular}`, referenceId: d.id, referenceType: 'DEBT'})}>Agendar Tarefa</button>}
                                            <button className="premium-remove-link" onClick={()=>{if(window.confirm("Remover conta?")) onRemove(d.id)}}>Remover</button>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="premium-carousel-slide">
                                    <div className="premium-card" style={{textAlign: 'center', padding: '40px'}}>
                                        <p style={{color: 'var(--premium-text-muted)'}}>Nenhum registro encontrado para este filtro.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {listaFiltrada.length > 1 && (
                        <div className="premium-nav-controls">
                            <button className="premium-nav-btn" onClick={()=>move(-1)}>‹</button>
                            <div className="premium-nav-info">
                                <span>{current + 1} / {listaFiltrada.length}</span>
                            </div>
                            <button className="premium-nav-btn" onClick={()=>move(1)}>›</button>
                        </div>
                    )}
                </main>

                <div className="premium-report-section">
                    <div className="premium-report-header">
                        <h3 style={{margin: 0}}>Relatório Consolidado</h3>
                    </div>
                    <div className="premium-table-container">
                        <table className="premium-report-table">
                            <thead>
                                <tr>
                                    <th>Banco</th>
                                    <th>Valor Original</th>
                                    <th>Proposta</th>
                                    <th>Parcelas</th>
                                    <th>Status</th>
                                    {onScheduleTask && <th>Ações</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {listaFiltrada.map((d, i) => d && (
                                    <tr key={d.id || `r-${i}`}>
                                        <td style={{fontWeight: 600}}>{d.banco}</td>
                                        <td>{fmt.format(parseBRLValue(d.valor))}</td>
                                        <td style={{color: 'var(--premium-warning)'}}>{fmt.format(parseBRLValue(d.vlrP) * (d.qtd || 1) + (d.tipo === 'parcelado' ? parseBRLValue(d.entrada) : 0))}</td>
                                        <td>
                                            <span style={{color: '#10b981', fontWeight: 'bold'}}>{getPaidCount(d)}</span> / {d.qtd || 1}
                                        </td>
                                        <td className={`status-${d.status || 'pendente'}`}>{(d.status || 'pendente').toUpperCase()}</td>
                                        {onScheduleTask && <td>
                                            <button style={{background: 'rgba(52, 152, 219, 0.2)', border: '1px solid #3498db', color: '#3498db', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem'}} onClick={()=>onScheduleTask({title: `Conta: ${d.banco} - ${d.titular}`, referenceId: d.id, referenceType: 'DEBT'})}>Agendar Tarefa</button>
                                        </td>}
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="premium-report-tfoot">
                                <tr>
                                    <td style={{fontWeight: 800, color: 'white'}}>TOTAIS FILTRADOS</td>
                                    <td style={{fontWeight: 800, color: 'var(--premium-accent)'}}>{fmt.format(totals.orig)}</td>
                                    <td style={{fontWeight: 800, color: 'var(--premium-warning)'}}>{fmt.format(totals.prop)}</td>
                                    <td style={{fontWeight: 800, color: 'var(--premium-success)'}}>
                                        Economia: {fmt.format(totals.eco)}
                                    </td>
                                    {onScheduleTask && <td></td>}
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>

            {isSaving && <div className="premium-saving-float">Sincronizando...</div>}
        </div>
    );
};

export default PremiumDashboard;
