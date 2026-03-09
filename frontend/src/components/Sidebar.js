import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
    const location = useLocation();
    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <aside className="sidebar">
            <ul className="sidebar-menu">
                <li className={isActive('/')}><Link to="/">Dashboard</Link></li>
                <li className={isActive('/collections') || location.pathname.startsWith('/collections')}><Link to="/collections">Collections</Link></li>
                <li className={isActive('/bookmarks')}><Link to="/bookmarks">Bookmarks</Link></li>
            </ul>
        </aside>
    );
};

export default Sidebar;
