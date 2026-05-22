import React, { useState, useEffect } from 'react';
import './JourneyInfo.css';
import { Objective } from './Objectives';
import { Deposit } from './DepositForm';

interface Trophy {
    nome: string;
    valor: number;
}

const initialTrophies: Trophy[] = [
    { nome: 'Penteadeira Ditália', valor: 900 },
    { nome: 'Guarda-Roupa Casal Luiza', valor: 1200 },
    { nome: 'Air Fryer Mondial Forno Oven', valor: 600 },
    { nome: 'Sanduicheira Britânia BGR25B', valor: 200 },
    { nome: 'Cadeira Gamer Belmóveis', valor: 700 },
    { nome: 'Fogão Cooktop Portátil Elétrico', valor: 200 },
    { nome: 'Smart TV 65" LG', valor: 4000 },
    { nome: 'Cortina Voil c/ Forro (6 unidades)', valor: 1200 },
    { nome: 'Secadora de Roupas Fischer', valor: 500 },
    { nome: 'Mesa de Escritório Anah', valor: 500 },
    { nome: 'Sofá Cama Retrátil E Reclinável', valor: 2500 },
    { nome: 'Conjunto Cama Box c/ Molas', valor: 1500 },
    { nome: 'Cabeceira Box Casal com Led', valor: 900 },
    { nome: 'Panela de Arroz Elétrica Mondial', valor: 200 },
    { nome: 'Panela de Pressão Elétrica Digital Mondial', valor: 500 },
    { nome: 'Panela elétrica de arroz Oster', valor: 200 },
    { nome: 'Panela de Pressão Elétrica Britânia', valor: 500 },
    { nome: 'Panela Elétrica PE-28 Redonda Mondial', valor: 200 },
    { nome: 'Panela Elétrica Mangiare Agratto', valor: 200 },
    { nome: 'Pipoqueira Elétrica Popflix Mondial', valor: 250 },
    { nome: 'Panela Multifuncional Micro Pressão', valor: 200 },
    { nome: 'Monitor Gamer Curvo (2 unidades)', valor: 1600 },
    { nome: 'Impressora Multifuncional HP', valor: 900 },
    { nome: 'Cafeteira Nescafé Dolce Gusto', valor: 500 },
    { nome: 'Suporte dois monitores', valor: 500 },
    { nome: 'Secador Taiff Style', valor: 200 },
    { nome: 'Régua Cabo Hub USB', valor: 150 },
    { nome: 'Conjunto Sala de Jantar', valor: 700 },
    { nome: 'Notebook Dell Inspiron', valor: 4000 },
    { nome: 'Grill Mondial G-03-RC', valor: 300 },
    { nome: 'Sanduicheira/Grill Britânia Press', valor: 200 },
    { nome: 'Panela Elet P/Fondue Oster', valor: 400 },
    { nome: 'Fritadeira Elétrica Air Fry Britânia', valor: 500 },
    { nome: 'PlayStation 5 Slim', valor: 4000 },
    { nome: 'PC Gamer Skill Aquarium', valor: 2500 },
    { nome: 'Sapateira Madesa Isis', valor: 600 },
    { nome: 'iPhone (apenas 2)', valor: 6000 }
].sort((a, b) => a.valor - b.valor);

interface JourneyInfoProps {
    exchangeRate: number;
    accumulatedBRL: number;
    targetBRL: number;
    targetUSD: number;
    objectives: Objective[];
    transactions: Deposit[];
    debts?: any[];
}

const JourneyInfo: React.FC<JourneyInfoProps> = ({ exchangeRate, accumulatedBRL, targetBRL, targetUSD, objectives, transactions, debts = [] }) => {
    const formatBRL = (val: number) => {
        try {
            return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
        } catch {
            return `R$ ${val.toFixed(2)}`;
        }
    };
    
    const formatUSD = (val: number) => {
        try {
            return val.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
        } catch {
            return `$ ${val.toFixed(2)}`;
        }
    };

    const [currentDate, setCurrentDate] = useState(new Date());
    const [simMonths, setSimMonths] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentDate(new Date());
        }, 60000); 
        return () => clearInterval(timer);
    }, []);

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

    const totalRemainingDebtsBRL = Array.isArray(debts)
        ? debts.filter(d => d.status !== 'quitado').reduce((sum, d) => {
            const vP = parseBRLValue(d.vlrP) || 0;
            const qT = parseInt(d.qtd) || 1;
            const qP = parseInt(d.parcelasPagas) || 0;
            const qRem = Math.max(0, qT - qP);
            const ent = (qP === 0) ? (parseBRLValue(d.entrada) || 0) : 0;
            return sum + (vP * qRem) + ent;
        }, 0)
        : 0;

    const totalConquestBRL = Math.max(0, targetBRL - totalRemainingDebtsBRL);
    const debtPercent = targetBRL > 0 ? (totalRemainingDebtsBRL / targetBRL) * 100 : 0;
    const conquestPercent = targetBRL > 0 ? (totalConquestBRL / targetBRL) * 100 : 0;

    const metaPorMesBRL = targetBRL / 100; 
    const metaPorDiaBRL = targetBRL / 3000;

    const metaPorMesUSD = targetUSD / 100;
    const metaPorDiaUSD = targetUSD / 3000;

    // Data de início fixa: 22/05/2026
    const START_DATE = new Date(2026, 4, 22); // mês 4 = maio (0-indexed)
    const END_DATE = new Date(2029, 11, 31);  // 31/12/2029

    const totalDaysJourney = Math.ceil((END_DATE.getTime() - START_DATE.getTime()) / (1000 * 60 * 60 * 24));
    const daysPassed = Math.max(0, Math.ceil((currentDate.getTime() - START_DATE.getTime()) / (1000 * 60 * 60 * 24)));
    const daysRemaining = Math.max(0, Math.ceil((END_DATE.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)));
    const journeyPercent = Math.min(100, (daysPassed / totalDaysJourney) * 100);

    const monthsPassed = Math.floor(daysPassed / 30);
    const daysInCurrentMonth = (daysPassed % 30) + 1;
    const monthsRemaining = Math.ceil(daysRemaining / 30);

    const startDate = START_DATE;

    const monthlyContribution = 2000;
    const projectedTotal = accumulatedBRL + (simMonths * monthlyContribution);

    return (
        <div className="adventure-container">
            <header className="hero-section">
                <div className="hero-content">
                    <h1>🚀 Meta & Saldo 🚀</h1>

                    <div className="meta-principal">
                        <div className="meta-card-stats grid-3">
                             <div className="meta-stat-item">
                                <span className="stat-label">💰 Saldo Real</span>
                                <span className="stat-value highlight-gold">
                                    {formatBRL(accumulatedBRL)}
                                </span>
                            </div>
                            <div className="meta-stat-item">
                                <span className="stat-label">⏳ Jornada</span>
                                <span className="stat-value">
                                    {monthsPassed}m {daysInCurrentMonth}d passados
                                </span>
                                <span style={{fontSize: '0.7em', color: 'rgba(255,255,255,0.5)'}}>
                                    {daysPassed} dias desde 22/05/2026
                                </span>
                                {/* Barra de progresso da jornada */}
                                <div style={{background: 'rgba(255,255,255,0.1)', borderRadius: '4px', height: '4px', marginTop: '6px', overflow: 'hidden'}}>
                                    <div style={{width: `${journeyPercent}%`, height: '100%', background: '#3b82f6', borderRadius: '4px', transition: 'width 0.5s'}} />
                                </div>
                                <span style={{fontSize: '0.65em', color: '#3b82f6', marginTop: '3px', display: 'block'}}>
                                    {journeyPercent.toFixed(1)}% — Faltam {daysRemaining} dias ({monthsRemaining} meses) até dez/2029
                                </span>
                            </div>
                            <div className="meta-stat-item">
                                <span className="stat-label">🎯 Meta Total</span>
                                <span className="stat-value">{formatBRL(targetBRL)}</span>
                                <span style={{fontSize: '0.8em', color: '#3498db', fontWeight: 'bold'}}>USD {formatUSD(targetUSD)}</span>
                            </div>
                        </div>

                        <div className="meta-card-stats grid-2" style={{marginTop: '15px'}}>
                            <div className="meta-stat-item">
                                <span className="stat-label">📅 Meta Mensal</span>
                                <span className="stat-value">{formatBRL(metaPorMesBRL)}</span>
                                <span style={{fontSize: '0.8em', color: '#3498db', fontWeight: 'bold'}}>USD {formatUSD(metaPorMesUSD)}</span>
                            </div>
                            <div className="meta-stat-item">
                                <span className="stat-label">📈 Projeção (+{simMonths}m)</span>
                                <span className="stat-value" style={{color: '#3498db'}}>{formatBRL(projectedTotal)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>


            <div className="adventure-content">
                <div className="split-meta-container glass">
                    <h3 className="split-title">🎯 Divisão da Meta: Dívida vs. Conquista</h3>
                    
                    <div className="split-progress-bar-container">
                        <div className="split-progress-bar">
                            <div 
                                className="split-progress-fill debt" 
                                style={{ width: `${debtPercent}%` }}
                                title={`Dívida: ${debtPercent.toFixed(1)}%`}
                            ></div>
                            <div 
                                className="split-progress-fill conquest" 
                                style={{ width: `${conquestPercent}%` }}
                                title={`Conquista: ${conquestPercent.toFixed(1)}%`}
                            ></div>
                        </div>
                        <div className="split-legend">
                            <span style={{color: '#ff7e5f'}}>🔴 Dívida: {debtPercent.toFixed(1)}%</span>
                            <span style={{color: '#3b82f6'}}>🔵 Conquista: {conquestPercent.toFixed(1)}%</span>
                        </div>
                    </div>

                    <div className="split-cards-grid">
                        <div className="split-card debt-card">
                            <div className="split-card-header">
                                <span className="icon">🔴</span>
                                <h4>Dívida (Foco de Quitação)</h4>
                            </div>
                            <div className="split-card-value">{formatBRL(totalRemainingDebtsBRL)}</div>
                            <p className="split-card-desc">
                                Valor restante negociado necessário para quitar todas as suas pendências financeiras ativas no sistema.
                            </p>
                        </div>

                        <div className="split-card conquest-card">
                            <div className="split-card-header">
                                <span className="icon">🚀</span>
                                <h4>Conquista (Futuro & Sonhos)</h4>
                            </div>
                            <div className="split-card-value">{formatBRL(totalConquestBRL)}</div>
                            <p className="split-card-desc">
                                Valor livre que você terá acumulado para investir, conquistar bens e garantir sua liberdade financeira ao bater a meta.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="info-card-original glass" style={{ marginTop: '20px' }}>
                    <p style={{textAlign: 'center', opacity: 0.8}}>
                        Ao economizar e manter seus ganhos diários, você quitará a totalidade da sua dívida e terá mais de <strong>{formatBRL(totalConquestBRL)}</strong> acumulados de forma livre!
                    </p>
                </div>
            </div>
        </div>
    );
};

export default JourneyInfo;
