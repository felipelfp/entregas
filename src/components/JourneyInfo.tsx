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
}

const JourneyInfo: React.FC<JourneyInfoProps> = ({ exchangeRate, accumulatedBRL, targetBRL, targetUSD, objectives, transactions }) => {
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

    const metaPorMesBRL = targetBRL / 100; 
    const metaPorDiaBRL = targetBRL / 3000;

    const metaPorMesUSD = targetUSD / 100;
    const metaPorDiaUSD = targetUSD / 3000;

    let daysPassed = 0;
    let startDate = new Date();

    if (transactions && transactions.length > 0) {
        const sortedDates = [...transactions]
            .map(t => new Date(t.date).getTime())
            .filter(t => !isNaN(t))
            .sort((a, b) => a - b);
        if (sortedDates.length > 0) {
            const firstDate = sortedDates[0];
            startDate = new Date(firstDate);
            daysPassed = Math.max(1, Math.ceil((currentDate.getTime() - firstDate) / (1000 * 60 * 60 * 24)));
        } else {
            daysPassed = 1;
        }
    } else {
        const savedStartDate = localStorage.getItem('journeyStartDate');
        if (savedStartDate && savedStartDate !== "Invalid Date") {
            startDate = new Date(savedStartDate);
            if (isNaN(startDate.getTime())) {
                startDate = new Date();
                localStorage.setItem('journeyStartDate', startDate.toISOString());
            }
            daysPassed = Math.max(1, Math.ceil((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
        } else {
            startDate = new Date();
            localStorage.setItem('journeyStartDate', startDate.toISOString());
            daysPassed = 1;
        }
    }

    if (isNaN(daysPassed)) daysPassed = 1;
    const currentMonth = Math.ceil(daysPassed / 30);
    const daysInCurrentMonth = ((daysPassed - 1) % 30) + 1;

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
                                    Mês {currentMonth} de 100 • Dia {daysInCurrentMonth}
                                </span>
                                <span style={{fontSize: '0.7em', color: 'rgba(255,255,255,0.5)'}}>
                                    ({daysPassed} dias acumulados)
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

                         <div className="simulation-controls" style={{marginTop: '20px'}}>
                            <input 
                                type="range" 
                                min="0" max="60" 
                                value={simMonths} 
                                onChange={(e) => setSimMonths(parseInt(e.target.value))}
                                style={{width: '100%', accentColor: '#FFD700'}} 
                            />
                            <p style={{fontSize: '0.8em', marginTop: '5px', opacity: 0.8, textAlign: 'center'}}>
                                Arraste para simular aporte mensal de R$ 2.000,00
                            </p>
                        </div>

                        <div style={{marginTop: '15px', padding: '10px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.05)', fontSize: '0.8em', textAlign: 'center', opacity: 0.7}}>
                            <p>
                                📅 Data de Início da Jornada: {(() => {
                                    try {
                                        return startDate.toLocaleDateString('pt-BR');
                                    } catch {
                                        return new Date().toLocaleDateString('pt-BR');
                                    }
                                })()} ({(() => {
                                    try {
                                        return startDate.toLocaleDateString('pt-BR', {weekday: 'long'});
                                    } catch {
                                        return new Date().toLocaleDateString('pt-BR', {weekday: 'long'});
                                    }
                                })()})
                            </p>
                            <button 
                                onClick={() => {
                                    localStorage.removeItem('journeyStartDate');
                                    setCurrentDate(new Date());
                                    window.location.reload();
                                }}
                                style={{marginTop: '8px', padding: '5px 10px', fontSize: '0.75em', backgroundColor: '#ff6b6b', border: 'none', borderRadius: '4px', color: 'white', cursor: 'pointer'}}
                            >
                                🔄 Resetar Data
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="adventure-content">
                <div className="info-card-original glass">
                    <p style={{textAlign: 'center', opacity: 0.8}}>
                        Siga os aportes mensais para atingir a meta atualizada de {formatBRL(targetBRL)} em 100 meses.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default JourneyInfo;
