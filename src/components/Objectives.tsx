import React from 'react';
import './Objectives.css';

export interface Objective {
    id: string;
    icon: string;
    name: string;
    targetBRL: number;
    targetUSD: number;
    accumulatedBRL: number;
    completed: boolean;
    category: 'BR' | 'USA' | 'EMERGENCY';
}

export const initialObjectives: Objective[] = [

    { id: 'peugeot', icon: '🏎️', name: 'Peugeot 308', targetBRL: 44500, targetUSD: 8900, accumulatedBRL: 0, completed: false, category: 'BR' },
    { id: 'iphones_combo', icon: '📱', name: 'iPhone (x2)', targetBRL: 8600, targetUSD: 1720, accumulatedBRL: 0, completed: false, category: 'BR' },
    { id: 'guarda_roupa', icon: '👗', name: 'Guarda-Roupa Casal Luiza', targetBRL: 1200, targetUSD: 240, accumulatedBRL: 0, completed: false, category: 'BR' },
    { id: 'air_fryer_combo', icon: '🍳', name: 'Air Fryer Mondial & Britânia (x2)', targetBRL: 1100, targetUSD: 220, accumulatedBRL: 0, completed: false, category: 'BR' },
    { id: 'sanduicheira_combo', icon: '🥪', name: 'Sanduicheiras (x2)', targetBRL: 400, targetUSD: 80, accumulatedBRL: 0, completed: false, category: 'BR' },
    { id: 'cadeira_gamer_bel', icon: '💺', name: 'Cadeira Gamer Belmóveis (x2)', targetBRL: 1400, targetUSD: 280, accumulatedBRL: 0, completed: false, category: 'BR' },
    { id: 'cooktop', icon: '🔥', name: 'Fogão Cooktop Portátil Elétrico', targetBRL: 200, targetUSD: 40, accumulatedBRL: 0, completed: false, category: 'BR' },
    { id: 'tv_65', icon: '📺', name: 'Smart TV 65" LG', targetBRL: 4000, targetUSD: 800, accumulatedBRL: 0, completed: false, category: 'BR' },
    { id: 'cortinas', icon: '🛋️', name: 'Cortina Voil c/ Forro (6un)', targetBRL: 1200, targetUSD: 240, accumulatedBRL: 0, completed: false, category: 'BR' },
    { id: 'penteadeira', icon: '💄', name: 'Penteadeira Ditália', targetBRL: 900, targetUSD: 180, accumulatedBRL: 0, completed: false, category: 'BR' },
    { id: 'secadora', icon: '🧺', name: 'Secadora de Roupas Fischer', targetBRL: 500, targetUSD: 100, accumulatedBRL: 0, completed: false, category: 'BR' },
    { id: 'mesa_escritorio', icon: '💻', name: 'Mesa de Escritório Anah', targetBRL: 500, targetUSD: 100, accumulatedBRL: 0, completed: false, category: 'BR' },
    { id: 'sofa_cama', icon: '🛋️', name: 'Sofá Cama Retrátil E Reclinável', targetBRL: 2500, targetUSD: 500, accumulatedBRL: 0, completed: false, category: 'BR' },
    { id: 'cama_box', icon: '🛏️', name: 'Conjunto Cama Box c/ Molas', targetBRL: 1500, targetUSD: 300, accumulatedBRL: 0, completed: false, category: 'BR' },
    { id: 'cabeceira', icon: '🛌', name: 'Cabeceira Box Casal com Led', targetBRL: 900, targetUSD: 180, accumulatedBRL: 0, completed: false, category: 'BR' },
    { id: 'panela_arroz_combo', icon: '🍚', name: 'Panelas de Arroz (x2)', targetBRL: 400, targetUSD: 80, accumulatedBRL: 0, completed: false, category: 'BR' },
    { id: 'panela_pressao_combo', icon: '🍲', name: 'Panelas de Pressão Elétrica (x2)', targetBRL: 1000, targetUSD: 200, accumulatedBRL: 0, completed: false, category: 'BR' },
    { id: 'panela_eletrica_combo', icon: '🥘', name: 'Panelas Elétricas (x2)', targetBRL: 400, targetUSD: 80, accumulatedBRL: 0, completed: false, category: 'BR' },
    { id: 'pipoqueira', icon: '🍿', name: 'Pipoqueira Elétrica Popflix', targetBRL: 250, targetUSD: 50, accumulatedBRL: 0, completed: false, category: 'BR' },
    { id: 'micro_pressao', icon: '🍲', name: 'Panela Multifuncional Micro Pressão', targetBRL: 200, targetUSD: 40, accumulatedBRL: 0, completed: false, category: 'BR' },
    { id: 'monitores_curvos', icon: '🖥️', name: 'Monitor Gamer Curvo (2un)', targetBRL: 1600, targetUSD: 320, accumulatedBRL: 0, completed: false, category: 'BR' },
    { id: 'impressora_hp', icon: '🖨️', name: 'Impressora Multifuncional HP', targetBRL: 900, targetUSD: 180, accumulatedBRL: 0, completed: false, category: 'BR' },
    { id: 'dolce_gusto', icon: '☕', name: 'Cafeteira Nescafé Dolce Gusto', targetBRL: 500, targetUSD: 100, accumulatedBRL: 0, completed: false, category: 'BR' },
    { id: 'suporte_monitores', icon: '🏗️', name: 'Suporte dois monitores', targetBRL: 500, targetUSD: 100, accumulatedBRL: 0, completed: false, category: 'BR' },
    { id: 'secador_taiff', icon: '💇', name: 'Secador Taiff Style', targetBRL: 200, targetUSD: 40, accumulatedBRL: 0, completed: false, category: 'BR' },
    { id: 'hub_usb', icon: '🔌', name: 'Régua Cabo Hub USB', targetBRL: 150, targetUSD: 30, accumulatedBRL: 0, completed: false, category: 'BR' },
    { id: 'sala_jantar', icon: '🍽️', name: 'Conjunto Sala de Jantar', targetBRL: 700, targetUSD: 140, accumulatedBRL: 0, completed: false, category: 'BR' },
    { id: 'notebook_dell', icon: '💻', name: 'Notebook Dell Inspiron', targetBRL: 4000, targetUSD: 800, accumulatedBRL: 0, completed: false, category: 'BR' },
    { id: 'grill_mondial', icon: '🥩', name: 'Grill Mondial G-03-RC', targetBRL: 300, targetUSD: 60, accumulatedBRL: 0, completed: false, category: 'BR' },
    { id: 'panela_fondue', icon: '🫕', name: 'Panela Elet P/Fondue Oster', targetBRL: 400, targetUSD: 80, accumulatedBRL: 0, completed: false, category: 'BR' },
    { id: 'ps5_slim', icon: '🎮', name: 'PlayStation 5 Slim', targetBRL: 4000, targetUSD: 800, accumulatedBRL: 0, completed: false, category: 'BR' },
    { id: 'pc_gamer', icon: '🖥️', name: 'PC Gamer Skill Aquarium', targetBRL: 2500, targetUSD: 500, accumulatedBRL: 0, completed: false, category: 'BR' },
    { id: 'sapateira', icon: '👞', name: 'Sapateira Madesa Isis', targetBRL: 600, targetUSD: 120, accumulatedBRL: 0, completed: false, category: 'BR' },

    { id: 'passport', icon: '📘', name: 'Passaporte (2 pessoas)', targetUSD: 600, targetBRL: 3000, accumulatedBRL: 0, completed: false, category: 'USA' },
    { id: 'visa', icon: '🛂', name: 'Visto (2 pessoas)', targetUSD: 280, targetBRL: 1400, accumulatedBRL: 0, completed: false, category: 'USA' },
    { id: 'flights', icon: '✈️', name: 'Passagens (2 pessoas)', targetUSD: 1200, targetBRL: 6000, accumulatedBRL: 0, completed: false, category: 'USA' },
    { id: 'first_shop', icon: '🛒', name: 'Primeira Compra USA', targetUSD: 600, targetBRL: 3000, accumulatedBRL: 0, completed: false, category: 'USA' },
    { id: 'clothes', icon: '👕', name: 'Roupas Novas', targetUSD: 1000, targetBRL: 5000, accumulatedBRL: 0, completed: false, category: 'USA' },
    { id: 'rent_usa', icon: '🏠', name: 'Aluguel USA (1º Mês)', targetUSD: 10000, targetBRL: 50000, accumulatedBRL: 0, completed: false, category: 'USA' },
    { id: 'car_usa', icon: '🚙', name: 'Carro USA', targetUSD: 5000, targetBRL: 25000, accumulatedBRL: 0, completed: false, category: 'USA' },
    { id: 'furniture_usa', icon: '🛋️', name: 'Mobília USA', targetUSD: 3000, targetBRL: 15000, accumulatedBRL: 0, completed: false, category: 'USA' },

    { id: 'reserva_mensal', icon: '🛡️', name: 'Reserva de Emergência Mensal', targetUSD: 95.16, targetBRL: 500, accumulatedBRL: 0, completed: false, category: 'EMERGENCY' },
    { id: 'return_ticket', icon: '🔙', name: 'Passagem de Volta', targetUSD: 1440, targetBRL: 7200, accumulatedBRL: 0, completed: false, category: 'EMERGENCY' },
    { id: 'emergency_fund', icon: '🆘', name: 'Uso de Emergência', targetUSD: 5700, targetBRL: 28500, accumulatedBRL: 0, completed: false, category: 'EMERGENCY' },
];

interface ObjectivesProps {
    category: 'BR' | 'USA' | 'EMERGENCY';
    objectives: Objective[];
    onToggleComplete: (id: string) => void;
    onAddObjective: (obj: Partial<Objective>) => void;
    onDeleteObjective: (id: string) => void;
    onUpdateObjective?: (obj: Objective) => void;
    exchangeRate: number;
    onScheduleTask?: (taskData: any) => void;
}

const Objectives: React.FC<ObjectivesProps> = ({ category, objectives, onToggleComplete, onAddObjective, onDeleteObjective, onUpdateObjective, exchangeRate, onScheduleTask }) => {
    const [isAdding, setIsAdding] = React.useState(false);
    const [newObj, setNewObj] = React.useState({ name: '', targetBRL: '', icon: '🎯' });
    const [searchTerm, setSearchTerm] = React.useState('');
    const [editingId, setEditingId] = React.useState<string | null>(null);
    const [editObjParams, setEditObjParams] = React.useState({ name: '', targetBRL: '', accumulatedBRL: '', icon: '' });

    const listRef = React.useRef<HTMLDivElement | null>(null);
    const isHovered = React.useRef(false);

    React.useEffect(() => {
        const container = listRef.current;
        if (!container) return;

        let animationFrameId: number;
        const speed = 0.5; 

        const scrollLoop = () => {
            const maxScrollLeft = container.scrollWidth - container.clientWidth;
            if (maxScrollLeft > 0 && !isHovered.current) {
                container.scrollLeft += speed;
                if (container.scrollLeft >= maxScrollLeft - 1) {
                    container.scrollLeft = 0; 
                }
            }
            animationFrameId = requestAnimationFrame(scrollLoop);
        };

        animationFrameId = requestAnimationFrame(scrollLoop);

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    const formatBRLInput = (value: string) => {

        let numericValue = value.replace(/\D/g, '');

        if (!numericValue) return '';

        if (numericValue.length <= 2) {
            return numericValue;
        }

        const length = numericValue.length;
        const intPart = numericValue.substring(0, length - 2);
        const decPart = numericValue.substring(length - 2);

        const intFormatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

        return `${intFormatted},${decPart}`;
    };

    const parseBRLValue = (value: string): number => {

        const withoutDots = value.replace(/\./g, '');

        const withDot = withoutDots.replace(',', '.');
        return parseFloat(withDot) || 0;
    };

    const filteredObjectives = objectives
        .filter(obj => obj.category === category)
        .filter(obj => obj.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => a.targetBRL - b.targetBRL);

    const handleAdd = () => {
        if (!newObj.name || !newObj.targetBRL) return;
        onAddObjective({
            name: newObj.name,
            targetBRL: parseBRLValue(newObj.targetBRL),
            icon: newObj.icon || '🎯',
            category: category,
            accumulatedBRL: 0,
            completed: false
        });
        setNewObj({ name: '', targetBRL: '', icon: '🎯' });
        setIsAdding(false);
    };

    const getDisplayValues = (obj: Objective) => {
        let displayTargetBRL = obj.targetBRL;
        let displayTargetUSD = obj.targetUSD || (obj.targetBRL / exchangeRate);

        if (obj.category === 'USA') {
            displayTargetBRL = (obj.targetUSD || (obj.targetBRL / exchangeRate)) * exchangeRate;
        } else {
            displayTargetUSD = obj.targetBRL / exchangeRate;
        }

        return { displayTargetBRL, displayTargetUSD };
    };

    const handleSaveEdit = (obj: Objective) => {
        if (!onUpdateObjective) return;

        const updatedTarget = parseBRLValue(editObjParams.targetBRL);
        const updatedAccumulated = parseBRLValue(editObjParams.accumulatedBRL);

        onUpdateObjective({
            ...obj,
            name: editObjParams.name || obj.name,
            icon: editObjParams.icon || obj.icon,
            targetBRL: updatedTarget,
            targetUSD: updatedTarget / exchangeRate,
            accumulatedBRL: updatedAccumulated,
        });
        setEditingId(null);
    };

    const startEditing = (obj: Objective) => {
        setEditObjParams({
            name: obj.name,
            icon: obj.icon,
            targetBRL: formatBRLInput(obj.targetBRL.toFixed(2).replace('.', ',')),
            accumulatedBRL: formatBRLInput(obj.accumulatedBRL.toFixed(2).replace('.', ','))
        });
        setEditingId(obj.id);
    };

    return (
        <div className="objectives-section">
            <h2 className="objectives-title">Objetivos {category}</h2>

            {}
            <div className="objectives-search-container">
                <input 
                    type="text" 
                    placeholder="🔍 Digite para pesquisar objetivos..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="objectives-search-input"
                />
                {searchTerm && (
                    <button 
                        className="objectives-search-clear"
                        onClick={() => setSearchTerm('')}
                        title="Limpar pesquisa"
                    >
                        ✕
                    </button>
                )}
            </div>

            <div 
                ref={listRef}
                className="objectives-list"
                onMouseEnter={() => { isHovered.current = true; }}
                onMouseLeave={() => { isHovered.current = false; }}
                onTouchStart={() => { isHovered.current = true; }}
                onTouchEnd={() => { isHovered.current = false; }}
                onWheel={(e) => {
                    const container = e.currentTarget;
                    container.scrollLeft += e.deltaY;
                }}
            >
                {}
                {!isAdding ? (
                    <div className="objective-card-add-trigger" onClick={() => setIsAdding(true)}>
                        <span className="add-plus-icon">+</span>
                        <span className="add-text">Adicionar Objetivo {category}</span>
                    </div>
                ) : (
                    <div className="objective-card-expanded add-mode glass">
                        <div className="card-header">
                            <input 
                                className="icon-input-premium"
                                type="text" 
                                value={newObj.icon} 
                                onChange={e => setNewObj({...newObj, icon: e.target.value})}
                                placeholder="🎯"
                            />
                            <div className="header-info">
                                <input 
                                    className="name-input-premium"
                                    type="text" 
                                    value={newObj.name} 
                                    onChange={e => setNewObj({...newObj, name: e.target.value})}
                                    placeholder="Nome do Objetivo..."
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="card-body">
                            <div className="stat-row">
                                <span>Meta BRL (R$)</span>
                                <input 
                                    className="value-input-premium"
                                    type="text" 
                                    value={newObj.targetBRL} 
                                    onChange={e => setNewObj({...newObj, targetBRL: formatBRLInput(e.target.value)})}
                                    placeholder="0,00"
                                    maxLength={15}
                                />
                            </div>
                            <div className="add-card-actions">
                                <button className="cancel-add-btn" onClick={() => setIsAdding(false)}>Cancelar</button>
                                <button className="confirm-add-btn-premium" onClick={handleAdd}>Salvar</button>
                            </div>
                        </div>
                    </div>
                )}

                {filteredObjectives.map((obj) => {
                    const { displayTargetBRL, displayTargetUSD } = getDisplayValues(obj);
                    const isEditing = editingId === obj.id;

                    if (isEditing) {
                        return (
                            <div key={`edit-${obj.id}`} className="objective-card-expanded add-mode glass">
                                <div className="card-header">
                                    <input 
                                        className="icon-input-premium"
                                        type="text" 
                                        value={editObjParams.icon} 
                                        onChange={e => setEditObjParams({...editObjParams, icon: e.target.value})}
                                    />
                                    <div className="header-info">
                                        <input 
                                            className="name-input-premium"
                                            type="text" 
                                            value={editObjParams.name} 
                                            onChange={e => setEditObjParams({...editObjParams, name: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="card-body">
                                    <div className="stat-row">
                                        <span>Meta BRL (R$)</span>
                                        <input 
                                            className="value-input-premium"
                                            type="text" 
                                            value={editObjParams.targetBRL} 
                                            onChange={e => setEditObjParams({...editObjParams, targetBRL: formatBRLInput(e.target.value)})}
                                        />
                                    </div>
                                    <div className="stat-row">
                                        <span>Acumulado (R$)</span>
                                        <input 
                                            className="value-input-premium"
                                            type="text" 
                                            value={editObjParams.accumulatedBRL} 
                                            onChange={e => setEditObjParams({...editObjParams, accumulatedBRL: formatBRLInput(e.target.value)})}
                                        />
                                    </div>
                                    <div className="add-card-actions">
                                        <button className="cancel-add-btn" onClick={() => setEditingId(null)}>Cancelar</button>
                                        <button className="confirm-add-btn-premium" onClick={() => handleSaveEdit(obj)}>Salvar Edição</button>
                                    </div>
                                </div>
                            </div>
                        );
                    }

                    return (
                        <div
                            key={obj.id}
                            className={`objective-card-expanded glass ${obj.completed ? 'completed' : ''}`}
                        >
                            <div className="card-header">
                                <span className="objective-icon">{obj.icon}</span>
                                <div className="header-info">
                                    <h3 className="card-title">{obj.name}</h3>
                                    <div className="status-badge">
                                        {obj.completed ? 'Concluído' : 'Em andamento'}
                                    </div>
                                </div>
                                <div className="card-actions-top">
                                    <button 
                                        className="edit-obj-btn"
                                        style={{ background: 'none', border: 'none', color: '#38f9d7', cursor: 'pointer', fontSize: '1.2rem', padding: '0 5px' }}
                                        onClick={() => startEditing(obj)}
                                        title="Editar Objetivo"
                                    >
                                        ✏️
                                    </button>
                                    <button 
                                        className="delete-obj-btn"
                                        onClick={() => onDeleteObjective(obj.id)}
                                        title="Excluir Objetivo"
                                    >
                                        ×
                                    </button>
                                    <label className="complete-checkbox-compact">
                                        <input
                                            type="checkbox"
                                            checked={obj.completed}
                                            onChange={() => onToggleComplete(obj.id)}
                                        />
                                    </label>
                                </div>
                            </div>

                            <div className="card-body">
                                <div className="stat-row">
                                    <span>Meta (BRL)</span>
                                    <strong>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(displayTargetBRL)}</strong>
                                </div>
                                <div className="stat-row">
                                    <span>Meta (USD)</span>
                                    <strong>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(displayTargetUSD)}</strong>
                                </div>
                                <div className="stat-row">
                                    <span>Acumulado (BRL)</span>
                                    <strong className="highlight-value">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(obj.accumulatedBRL)}</strong>
                                </div>
                                <div className="stat-row">
                                    <span>Acumulado (USD)</span>
                                    <strong className="highlight-value-usd">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(obj.accumulatedBRL / exchangeRate)}</strong>
                                </div>
                                {onScheduleTask && (
                                    <div className="card-scheduler">
                                        <button 
                                            className="schedule-task-btn" 
                                            onClick={() => onScheduleTask({
                                                title: `Lembrete: Objetivo ${obj.name}`,
                                                referenceId: obj.id, 
                                                referenceType: 'OBJECTIVE'
                                            })}
                                        >
                                            ⏳ Agendar Tarefa
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Objectives;
