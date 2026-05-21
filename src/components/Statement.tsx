import React from 'react';
import { Deposit } from './DepositForm';
import './Statement.css';

interface StatementProps {
    transactions: Deposit[];
    onDelete: (id: number) => void;
}

const Statement: React.FC<StatementProps> = ({ transactions, onDelete }) => {
    const [searchTerm, setSearchTerm] = React.useState('');

    const filteredTransactions = transactions.filter(tx =>
        tx.bank.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="statement-container glass">
            <h3 className="statement-title">Extrato Recente</h3>

            {}
            <div className="statement-search-container">
                <input 
                    type="text" 
                    placeholder="🔍 Pesquisar por banco..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="statement-search-input"
                />
                {searchTerm && (
                    <button 
                        className="statement-search-clear"
                        onClick={() => setSearchTerm('')}
                        title="Limpar pesquisa"
                    >
                        ✕
                    </button>
                )}
            </div>

            <div className="statement-list">
                {filteredTransactions.length === 0 ? (
                    <div className="empty-state">
                        <span>{searchTerm ? 'Nenhuma transação encontrada' : 'Nenhuma transação registrada'}</span>
                    </div>
                ) : (
                    filteredTransactions.map((tx) => (
                        <div key={tx.id} className="transaction-item">
                            <div className="tx-left">
                                <span className="tx-icon">🏦</span>
                                <div className="tx-details">
                                    <span className="tx-bank">{tx.bank}</span>
                                    <span className="tx-date">{new Date(tx.date).toLocaleDateString('pt-BR')} • {tx.time}</span>
                                </div>
                            </div>
                            <div className="tx-right">
                                <div className="tx-values">
                                    <span className="tx-amount positive">
                                        + {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(tx.amountBRL)}
                                    </span>
                                    <span className="tx-usd">
                                        ({new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(tx.amountUSD)})
                                    </span>
                                </div>
                                <button
                                    className="delete-btn"
                                    onClick={() => onDelete(Number(tx.id))}
                                    title="Excluir transação"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Statement;
