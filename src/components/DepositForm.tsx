import React, { useState, useEffect } from 'react';
import './DepositForm.css';
import { Objective } from './Objectives';

interface DepositFormProps {
    exchangeRate: number;
    onDeposit: (deposit: Deposit, objectiveId?: string) => void;
    objectives: Objective[];
}

export interface Deposit {
    id: number | string;
    date: string;
    time: string;
    amountBRL: number;
    amountUSD: number;
    bank: string;
    objectiveId?: string;
}

const DepositForm: React.FC<DepositFormProps> = ({ exchangeRate, onDeposit, objectives }) => {
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [amountBRL, setAmountBRL] = useState('');
    const [amountUSD, setAmountUSD] = useState('');
    const [bank, setBank] = useState('');
    const [selectedObjectiveId, setSelectedObjectiveId] = useState<string>('');

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

    const parseUSDValue = (value: string): number => {
        if (!value) return 0;
        if (value.includes('.') && !value.includes(',')) {
            const parts = value.split('.');
            if (parts.length === 2 && parts[1].length <= 2) {
                return parseFloat(value) || 0;
            }
        }
        const withoutDots = value.replace(/\./g, '');
        const withDot = withoutDots.replace(',', '.');
        return parseFloat(withDot) || 0;
    };

    useEffect(() => {

        const now = new Date();
        setDate(now.toISOString().split('T')[0]);
        setTime(now.toTimeString().split(' ')[0].substring(0, 5));
    }, []);

    const handleBRLChange = (value: string) => {
        const formatted = formatBRLInput(value);
        setAmountBRL(formatted);

        const brl = parseBRLValue(formatted);
        if (!isNaN(brl) && exchangeRate > 0) {
            setAmountUSD((brl / exchangeRate).toFixed(2));
        } else {
            setAmountUSD('');
        }
    };

    const handleUSDChange = (value: string) => {
        const formatted = formatBRLInput(value);
        setAmountUSD(formatted);

        const usd = parseUSDValue(formatted);
        if (!isNaN(usd) && exchangeRate > 0) {
            const brlValue = usd * exchangeRate;
            setAmountBRL(formatBRLInput(brlValue.toString()));
        } else {
            setAmountBRL('');
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amountBRL || !bank) return;

        const newDeposit: Deposit = {
            id: 0, 
            date,
            time,
            amountBRL: parseBRLValue(amountBRL),
            amountUSD: parseUSDValue(amountUSD || '0'),
            bank,
            objectiveId: selectedObjectiveId || undefined,
        };

        onDeposit(newDeposit, selectedObjectiveId || undefined);

        setAmountBRL('');
        setAmountUSD('');
        setSelectedObjectiveId('');
    };

    return (
        <form className="deposit-form glass" onSubmit={handleSubmit}>
            <h3 className="form-title">Novo Depósito</h3>

            <div className="form-row">
                <div className="form-group">
                    <label>Data</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Hora</label>
                    <input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        required
                    />
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Valor (BRL)</label>
                    <input
                        type="text"
                        value={amountBRL}
                        onChange={(e) => handleBRLChange(e.target.value)}
                        placeholder="R$ 0,00"
                        maxLength={15}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Valor (USD)</label>
                    <input
                        type="text"
                        value={amountUSD}
                        onChange={(e) => handleUSDChange(e.target.value)}
                        placeholder="$ 0.00"
                        maxLength={15}
                    />
                </div>
            </div>

            <div className="form-group">
                <label>Banco / Origem</label>
                <input
                    type="text"
                    value={bank}
                    onChange={(e) => setBank(e.target.value)}
                    placeholder="Ex: Nubank, Inter, Bradesco..."
                    required
                />
            </div>

            <div className="form-group">
                <label>Destino (Opcional)</label>
                <select
                    value={selectedObjectiveId}
                    onChange={(e) => setSelectedObjectiveId(e.target.value)}
                    className="objective-select"
                >
                    <option value="">Saldo Geral (Sem objetivo específico)</option>
                    {objectives.map((obj) => (
                        <option key={obj.id} value={obj.id}>
                            {obj.icon} {obj.name}
                        </option>
                    ))}
                </select>
            </div>

            <button type="submit" className="submit-btn">
                Adicionar Depósito
            </button>
        </form>
    );
};

export default DepositForm;
