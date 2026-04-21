import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login, user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await login(email, password);
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-layout">
            <div className="auth-left">
                <div className="auth-glass-card">
                    <div className="auth-branding">SmartNote</div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1.5rem', marginTop: 0 }}>Welcome back</h2>
                    
                    {error && <div className="error-msg" style={{ color: 'var(--danger-color)', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '6px', marginBottom: '1.5rem', fontWeight: 500 }}>{error}</div>}
                    
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="name@example.com" />
                        </div>
                        <div className="form-group" style={{ marginBottom: '2rem' }}>
                            <label>Password</label>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
                        </div>
                        <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.85rem', fontSize: '1.05rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }} disabled={isLoading}>
                            {isLoading ? <><span className="spinner"></span> Authenticating...</> : 'Sign in securely'}
                        </button>
                    </form>
                    
                    <p style={{ marginTop: '2rem', textAlign: 'left', color: 'var(--text-muted)' }}>
                        Don't have an account? <Link to="/register" style={{ fontWeight: 600 }}>Create an account</Link>
                    </p>
                </div>
            </div>
            
            <div className="auth-right">
                <div className="auth-right-content">
                    <h2>Organize your intellect.</h2>
                    <p>
                        SmartNote connects your resources, tracks your learning consistency across 365 days, and builds a comprehensive map of your expanding knowledge base.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
