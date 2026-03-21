import React, { useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Library, Bookmark, ChevronLeft, ChevronRight } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
    const location = useLocation();
    const { user } = useContext(AuthContext);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    const getInitials = (name) => name ? name.charAt(0).toUpperCase() : 'U';

    return (
        <aside className={`sidebar glass-panel ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                {!isCollapsed && <h2 className="brand-logo">SmartNote</h2>}
                <button 
                    className="collapse-btn" 
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    aria-label="Toggle Sidebar"
                    title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                    {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>

            <div className="sidebar-usercard">
                <div className="avatar-wrapper">
                    <div className="avatar-circle">
                        {getInitials(user?.username || user?.name)}
                    </div>
                    <div className="online-dot"></div>
                </div>
                {!isCollapsed && (
                    <div className="user-info">
                        <span className="user-name">{user?.username || user?.name || 'Developer'}</span>
                        <span className="user-role">SmartNote Member</span>
                    </div>
                )}
            </div>
            
            <ul className="sidebar-menu">
                <li className={`menu-item ${isActive('/') ? 'active' : ''}`}>
                    <Link to="/" title={isCollapsed ? "Dashboard" : ""}>
                        <LayoutDashboard className="menu-icon" size={20} />
                        <span className="menu-text">Dashboard</span>
                    </Link>
                </li>
                <li className={`menu-item ${isActive('/collections') ? 'active' : ''}`}>
                    <Link to="/collections" title={isCollapsed ? "Collections" : ""}>
                        <Library className="menu-icon" size={20} />
                        <span className="menu-text">Collections</span>
                    </Link>
                </li>
                <li className={`menu-item ${isActive('/bookmarks') ? 'active' : ''}`}>
                    <Link to="/bookmarks" title={isCollapsed ? "Bookmarks" : ""}>
                        <Bookmark className="menu-icon" size={20} />
                        <span className="menu-text">Bookmarks</span>
                    </Link>
                </li>
            </ul>
        </aside>
    );
};

export default Sidebar;
