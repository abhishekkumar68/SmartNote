import React from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

const Landing = () => {
    return (
        <div className="landing-page">
            <nav className="landing-nav">
                <div className="landing-brand">SmartNote</div>
                <div className="landing-actions">
                    <Link to="/login" style={{ textDecoration: 'none', color: 'var(--text-color)', fontWeight: 500 }}>Sign in</Link>
                    <Link to="/register" className="btn-primary" style={{ textDecoration: 'none' }}>Get Started</Link>
                </div>
            </nav>

            <main className="landing-main">
                <div className="landing-hero" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <h1 className="hero-title">Your complete knowledge infrastructure.</h1>
                    <p className="hero-subtitle">
                        SmartNote connects your scattered resources, measures your learning consistency with robust analytics, and visually maps your expanding intellect in one professional dashboard.
                    </p>
                    <div className="hero-cta">
                        <Link to="/register" className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.2rem', display: 'inline-block', boxShadow: 'var(--shadow-md)', textDecoration: 'none' }}>
                            Start building for free
                        </Link>
                    </div>
                </div>

                <div className="landing-features">
                    <div className="landing-feature-card">
                        <h3>Resource Tracking</h3>
                        <p>Centralize your articles, videos, and tutorials in a powerful, searchable grid.</p>
                    </div>
                    <div className="landing-feature-card">
                        <h3>Consistency Data</h3>
                        <p>Monitor your daily learning habits proactively with our advanced, 365-day activity telemetry.</p>
                    </div>
                    <div className="landing-feature-card">
                        <h3>Knowledge Graph</h3>
                        <p>Visually connect your saved concepts and see exactly how your skills map together.</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Landing;
