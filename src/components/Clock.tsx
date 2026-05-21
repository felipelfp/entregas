import React, { useState, useEffect } from 'react';
import './Clock.css';

const Clock: React.FC = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const getFormattedTime = (timeZone: string) => {
        try {
            return time.toLocaleTimeString('pt-BR', {
                timeZone,
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return time.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    };

    const formattedDate = (() => {
        try {
            return time.toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        } catch (e) {
            return time.toLocaleDateString('pt-BR') || time.toDateString();
        }
    })();

    return (
        <div className="clock-container matrix-theme">
            <div className="clock-times-row">
                <div className="clock-item">
                    <span className="clock-label">BR</span>
                    <span className="clock-time">{getFormattedTime('America/Sao_Paulo')}</span>
                </div>
                <div className="clock-divider"></div>
                <div className="clock-item">
                    <span className="clock-label">USA</span>
                    <span className="clock-time">{getFormattedTime('America/New_York')}</span>
                </div>
            </div>
            <div className="clock-date">{formattedDate}</div>
        </div>
    );
};

export default Clock;
