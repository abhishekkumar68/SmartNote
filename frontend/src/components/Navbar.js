import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const { theme, toggleTheme } = useContext(ThemeContext);

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/">SmartNote</Link>
            </div>
            <div className="navbar-actions">
                <button onClick={toggleTheme} className="theme-toggle">
                    {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
                </button>
                {user ? (
                    <>
                        <span className="user-name">Welcome, {user.name}</span>
                        <button onClick={logout} className="btn-logout">Logout</button>
                    </>
                ) : (
                    <Link to="/login" className="btn-login">Login</Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
