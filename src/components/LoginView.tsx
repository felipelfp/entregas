import React, { useState } from 'react';
import './LoginView.css';
interface LoginViewProps {
    onLogin: (success: boolean) => void;
}
const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email === 'felipe.possa' && password === 'Fe535356@') {
            onLogin(true);
        } else {
            setError('Credenciais inválidas');
            onLogin(false);
        }
    };
    return (
        <div className="login-container">
            <div className="login-content">
                <div className="login-header">
                    <h1 className="login-title">Bem-vindo</h1>
                    <p className="login-subtitle">Faça login para continuar</p>
                </div>
                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Usuário</label>
                        <input
                            type="text"
                            placeholder="felipe.possa"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="login-input"
                        />
                    </div>
                    <div className="input-group">
                        <label>Senha</label>
                        <input
                            type="password"
                            placeholder="********"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="login-input"
                        />
                    </div>
                    {error && <div className="error-message">{error}</div>}
                    <button type="submit" className="login-button">
                        Entrar
                    </button>
                </form>
            </div>
        </div>
    );
};
export default LoginView;
