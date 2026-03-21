import React from 'react';
import { PackageOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EmptyState = ({ title, message, ctaText, ctaLink, icon: Icon = PackageOpen }) => {
    const navigate = useNavigate();
    return (
        <div className="glass-panel" style={{
            padding: '4rem 2rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px dashed var(--border-color)',
            animation: 'fadeInUp 0.5s ease-out',
            margin: '2rem 0'
        }}>
            <div style={{
                background: 'rgba(79, 70, 229, 0.1)',
                padding: '1.5rem',
                borderRadius: '50%',
                color: 'var(--primary-color)',
                marginBottom: '1.5rem'
            }}>
                <Icon size={48} strokeWidth={1.5} />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-color)' }}>{title}</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: '400px', lineHeight: 1.6 }}>
                {message}
            </p>
            {ctaText && ctaLink && (
                <button 
                    onClick={() => navigate(ctaLink)} 
                    className="btn-primary"
                    style={{ fontSize: '1rem', padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    {ctaText}
                </button>
            )}
        </div>
    );
};

export default EmptyState;
