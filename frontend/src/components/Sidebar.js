import React, { useState, useContext, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Library, Bookmark, ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
    const location = useLocation();
    const { user, updatePhoto } = useContext(AuthContext);
    const fileInputRef = useRef(null);
    const [isCollapsed, setIsCollapsed] = useState(() => {
        const saved = localStorage.getItem('sidebarCollapsed');
        return saved === 'true';
    });

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    const getInitials = (name) => name ? name.charAt(0).toUpperCase() : 'U';

    const getImageUrl = (path) => {
        if (!path) return '';
        const baseUrl = process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL.replace('/api', '') : 'http://localhost:5000';
        return `${baseUrl}${path}`;
    };

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append("photo", file);
            try {
                await updatePhoto(formData);
            } catch (error) {
                console.error("Failed to update photo", error);
            }
        }
    };

    return (
        <aside className={`sidebar glass-panel ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                {!isCollapsed && <h2 className="brand-logo">SmartNote</h2>}
                <button 
                    className="collapse-btn" 
                    onClick={() => {
                        const newState = !isCollapsed;
                        setIsCollapsed(newState);
                        localStorage.setItem('sidebarCollapsed', newState);
                    }}
                    aria-label="Toggle Sidebar"
                    title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                    {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>

            <div className="sidebar-usercard">
                <div className="avatar-wrapper" onClick={() => fileInputRef.current?.click()}>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handlePhotoChange} 
                        style={{ display: 'none' }}
                        accept="image/*"
                    />
                    <div className="avatar-circle">
                        {user?.profilePhoto ? (
                            <img src={getImageUrl(user.profilePhoto)} alt="Profile" className="profile-image" />
                        ) : (
                            getInitials(user?.username || user?.name)
                        )}
                        <div className="avatar-edit-overlay">
                            <Camera size={16} />
                        </div>
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
