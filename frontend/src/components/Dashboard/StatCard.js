import React from 'react';
import './StatCard.css';

const StatCard = ({ title, value, icon: Icon, colorClass, trend, trendUp, desc }) => {
    return (
        <div className={`stat-card glass-panel stat-${colorClass}`}>
            <div className="stat-card-header">
                <span className="stat-title">{title}</span>
                <div className={`stat-icon-wrapper text-${colorClass}`}>
                    <Icon size={18} strokeWidth={2.5} />
                </div>
            </div>
            
            <div className="stat-card-body">
                <h3 className="stat-value">{value}</h3>
            </div>
            
            {desc && (
                <div className="stat-card-footer">
                    {trend !== undefined && (
                        <span className={`stat-trend ${trendUp ? 'trend-up' : 'trend-down'}`}>
                            {trendUp ? '↑' : '↓'} {trend}%
                        </span>
                    )}
                    <span className="stat-desc">{desc}</span>
                </div>
            )}
        </div>
    );
};

export default StatCard;
