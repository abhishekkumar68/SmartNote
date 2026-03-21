import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, FileText, Video, Github, BookOpen, FileCode, Link, ExternalLink, Edit2, Trash2, Bookmark } from 'lucide-react';
import './Cards.css';

const ResourceCard = ({ resource, onDelete, onUpdateStatus, onToggleBookmark, onEdit }) => {
    const navigate = useNavigate();
    
    const getBadgeClass = (status) => {
        switch (status) {
            case 'Completed': return 'status-completed';
            case 'In Progress': return 'status-in-progress';
            default: return 'status-not-started';
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'Article': return <FileText size={18} />;
            case 'Video': return <Video size={18} />;
            case 'GitHub': return <Github size={18} />;
            case 'Course': return <BookOpen size={18} />;
            case 'Notes': return <FileCode size={18} />;
            default: return <Link size={18} />;
        }
    };

    const StatusSelect = () => (
        <select
            value={resource.status}
            onChange={(e) => { e.stopPropagation(); onUpdateStatus(resource._id, e.target.value); }}
            onClick={(e) => e.stopPropagation()}
            className={`badge ${getBadgeClass(resource.status)} animated-pill`}
            style={{ 
                border: 'none', 
                fontWeight: '600', 
                cursor: 'pointer',
                outline: 'none',
                paddingRight: '0.75rem'
            }}
        >
            <option value="Not Started" className="status-not-started">Not Started</option>
            <option value="In Progress" className="status-in-progress">In Progress</option>
            <option value="Completed" className="status-completed">Completed</option>
        </select>
    );

    return (
        <div className="card resource-card interactive-blur">
            <div className="card-header pb-2" style={{ alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', maxWidth: '85%' }}>
                    <div className="resource-icon-box" style={{ color: 'var(--primary-color)', marginTop: '2px' }}>
                        {getTypeIcon(resource.type)}
                    </div>
                    <div>
                        <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, lineHeight: 1.3 }}>
                            {resource.title}
                        </h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                            {resource.type}
                        </span>
                    </div>
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); onToggleBookmark(resource._id, !resource.bookmarked); }}
                    className={`bookmark-btn-elegant ${resource.bookmarked ? 'active-glow' : ''}`}
                    title={resource.bookmarked ? "Remove Bookmark" : "Bookmark"}
                >
                    <Bookmark 
                        size={20} 
                        fill={resource.bookmarked ? "currentColor" : "none"} 
                        color={resource.bookmarked ? "#fbbf24" : "var(--text-muted)"}
                    />
                </button>
            </div>

            <p className="card-desc resource-desc-clamped" style={{ fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1rem', flexGrow: 1 }}>
                {resource.description}
            </p>

            <div className="resource-tags" style={{ marginBottom: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {resource.tags && resource.tags.map(tag => (
                    <span key={tag} className="tag smart-tag">
                        {tag}
                    </span>
                ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div className="star-rating">
                    {[1, 2, 3, 4, 5].map(star => (
                        <Star 
                            key={star}
                            size={16}
                            fill={star <= resource.rating ? "#fbbf24" : "none"}
                            color={star <= resource.rating ? "#fbbf24" : "var(--border-color)"}
                            style={{ transition: 'all 0.2s', filter: star <= resource.rating ? 'drop-shadow(0 0 4px rgba(251, 191, 36, 0.4))' : 'none' }}
                        />
                    ))}
                </div>
                <StatusSelect />
            </div>

            <div className="resource-card-actions">
                <button 
                    onClick={(e) => { e.stopPropagation(); navigate(`/resource-details/${resource._id}`); }} 
                    className="action-btn open-btn"
                >
                    <ExternalLink size={16} /> Open
                </button>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {onEdit && (
                        <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="action-btn icon-btn edit-btn" title="Edit">
                            <Edit2 size={16} />
                        </button>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); onDelete(resource._id); }} className="action-btn icon-btn delete-btn" title="Delete">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResourceCard;
