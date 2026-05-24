import React, { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import './Sidebar.css';

interface SidebarProps {
    activeSection: string;
    onNavigate: (section: string) => void;
    isOpen: boolean;
    onClose: () => void;
    onLogout?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, onNavigate: setActiveSection, isOpen, onClose, onLogout }) => {
    const { theme, toggleTheme } = useTheme();

    const [installPrompt, setInstallPrompt] = useState<any>(null);
    const [isInstalled, setIsInstalled] = useState(false);
    const [installStatus, setInstallStatus] = useState<'idle' | 'success' | 'error'>('idle');

    useEffect(() => {

        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
        }

        const handler = (e: Event) => {
            e.preventDefault();
            setInstallPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handler as any);
        window.addEventListener('appinstalled', () => setIsInstalled(true));

        return () => {
            window.removeEventListener('beforeinstallprompt', handler as any);
        };
    }, []);

    const handleInstall = async () => {
        if (installPrompt) {
            installPrompt.prompt();
            const { outcome } = await installPrompt.userChoice;
            if (outcome === 'accepted') {
                setIsInstalled(true);
                setInstallPrompt(null);
                setInstallStatus('success');
            }
        } else {

            setInstallStatus('error');
            setTimeout(() => setInstallStatus('idle'), 4000);
        }
    };

    const menuItems = [
        { id: 'dashboard', icon: '📊', label: 'Painel' },
        { id: 'overview', icon: '💰', label: 'Visão Financeira' },
        { id: 'meta', icon: '🎯', label: 'Meta & Saldo' },
        { id: 'tasks', icon: '📅', label: 'Tarefas' },
        { id: 'br_goals', icon: '🇧🇷', label: 'Objetivos BR' },
        { id: 'usa_goals', icon: '🇺🇸', label: 'Objetivos USA' },
        { id: 'emergency', icon: '🚨', label: 'Emergência' },
        { id: 'report', icon: '📈', label: 'Relatório' },
        { id: 'premium', icon: '💎', label: 'Contas 2026' },
        { id: 'delivery', icon: '🛵', label: 'Entregas' },
        { id: 'notifications', icon: '🔔', label: 'Avisos & Alertas' },
    ];

    const handleItemClick = (id: string) => {
        setActiveSection(id);
        onClose();
    };

    return (
        <div className={`sidebar glass ${isOpen ? 'mobile-open' : ''} notranslate`}>
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <span className="logo-icon">🚀</span>
                </div>
                <button className="close-sidebar-btn" onClick={onClose}>✕</button>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
                        onClick={() => handleItemClick(item.id)}
                        title={item.label}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        <span className="nav-label">{item.label}</span>
                    </button>
                ))}
            </nav>

            <div className="sidebar-footer">
                {}
                {!isInstalled && (
                    <button
                        className={`install-app-btn ${installStatus === 'success' ? 'install-success' : ''} ${installStatus === 'error' ? 'install-hint' : ''}`}
                        onClick={handleInstall}
                        title="Instalar app no celular"
                    >
                        <span className="nav-icon">
                            {installStatus === 'success' ? '✅' : installStatus === 'error' ? '📋' : '📲'}
                        </span>
                        <span className="nav-label">
                            {installStatus === 'success'
                                ? 'App instalado!'
                                : installStatus === 'error'
                                ? 'Menu → Instalar'
                                : 'Baixar App'}
                        </span>
                    </button>
                )}

                {isInstalled && (
                    <div className="install-app-btn install-success" style={{ cursor: 'default' }}>
                        <span className="nav-icon">✅</span>
                        <span className="nav-label">App instalado</span>
                    </div>
                )}

                <button className="logout-btn" onClick={onLogout} title="Sair do Sistema">
                    <span className="nav-icon">🚪</span>
                    <span className="nav-label">Sair</span>
                </button>

                <button className="theme-toggle-btn" onClick={toggleTheme} title="Alternar Tema">
                    {theme === 'dark' ? '☀️' : '🌙'}
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
