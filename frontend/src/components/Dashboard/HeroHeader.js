import React from 'react';
import './HeroHeader.css';

const HeroHeader = ({ username = "Abhishek" }) => {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

    return (
        <div className="hero-header glass-panel">
            <div className="hero-content">
                <h1 className="hero-title">
                    {greeting}, <span className="gradient-text">{username}</span> <span className="wave">👋</span>
                </h1>
                <p className="hero-subtitle">
                    Ready to continue building your knowledge system?
                </p>
                <div className="animated-underline"></div>
            </div>
            <div className="abstract-pattern"></div>
        </div>
    );
};

export default HeroHeader;
