import React from 'react';
import { useNavigate } from 'react-router-dom';


const ResourceCard = ({ resource, onDelete, onUpdateStatus, onToggleBookmark, onEdit }) => {
    const navigate = useNavigate();
    const getBadgeClass = (status) => {
        switch (status) {
            case 'Completed': return 'badge status-completed';
            case 'In Progress': return 'badge status-in-progress';
            default: return 'badge status-not-started';
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'Article': return '📄';
            case 'Video': return '🎥';
            case 'GitHub': return '💻';
            case 'Course': return '📚';
            case 'Notes': return '📝';
            default: return '🔗';
        }
    };

    const targetUrl = resource.fileUrl ? `http://localhost:5000${resource.fileUrl}` : resource.link;

    return (
        <div className="card resource-card">
            <div className="card-header">
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                    <span title={resource.type}>{getTypeIcon(resource.type)}</span>
                    <span>{resource.title}</span>
                </h4>
                <button
                    onClick={(e) => { e.stopPropagation(); onToggleBookmark(resource._id, !resource.bookmarked); }}
                    className={`bookmark-btn ${resource.bookmarked ? 'active' : ''}`}
                    title={resource.bookmarked ? "Remove Bookmark" : "Bookmark Resource"}
                    style={{ marginLeft: 'auto' }}
                >
                    {resource.bookmarked ? '★' : '☆'}
                </button>
            </div>

            <p className="card-desc" style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>{resource.description}</p>

            {resource.rating > 0 ? (
                <div style={{ marginBottom: '1rem', color: '#fbbf24', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-color)', fontWeight: 'bold' }}>Learning Value:</span>
                    <span>{'★'.repeat(resource.rating)}{'☆'.repeat(5 - resource.rating)}</span>
                </div>
            ) : (
                <div style={{ marginBottom: '1rem', color: '#fbbf24', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-color)', fontWeight: 'bold' }}>Learning Value:</span>
                    <span>{'☆'.repeat(5)}</span>
                </div>
            )}

            <div className="resource-meta">
                <select
                    value={resource.status}
                    onChange={(e) => { e.stopPropagation(); onUpdateStatus(resource._id, e.target.value); }}
                    onClick={(e) => e.stopPropagation()}
                    className={getBadgeClass(resource.status)}
                    style={{ border: 'none', fontWeight: 'bold' }}
                >
                    <option value="Not Started" className="status-not-started">Not Started</option>
                    <option value="In Progress" className="status-in-progress">In Progress</option>
                    <option value="Completed" className="status-completed">Completed</option>
                </select>
                <div style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-color)', opacity: 0.7 }}>
                    {resource.type}
                </div>
            </div>

            <div className="resource-tags">
                {resource.tags && resource.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
            </div>

            <div className="card-actions" style={{ gap: '0.5rem', display: 'flex', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <button onClick={(e) => { e.stopPropagation(); navigate(`/resource-details/${resource._id}`); }} className="btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem' }}>Open Resource</button>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {onEdit && (
                        <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="btn-danger btn-edit" style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem', color: 'var(--primary-color)', borderColor: 'var(--primary-color)' }}>Edit</button>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); onDelete(resource._id); }} className="btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem' }}>Delete</button>
                </div>
            </div>
        </div>
    );
};

export default ResourceCard;
