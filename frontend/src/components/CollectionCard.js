import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Folder, ChevronRight, Clock } from 'lucide-react';
import './Cards.css';

const CollectionCard = ({ collection, onDelete }) => {
    const navigate = useNavigate();

    const formattedDate = collection.updatedAt 
        ? new Date(collection.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
        : 'Recently';

    return (
        <div 
            className="card collection-card" 
            onClick={() => navigate(`/collections/${collection._id}`)} 
            style={{ cursor: 'pointer', position: 'relative' }}
        >
            <div className="card-header" style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ background: 'rgba(79, 70, 229, 0.1)', padding: '0.5rem', borderRadius: '8px', color: 'var(--primary-color)' }}>
                        <Folder size={20} />
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-color)' }}>
                        {collection.title}
                    </h3>
                </div>
            </div>
            
            <p className="card-desc" style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>
                {collection.description}
            </p>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    <Clock size={14} />
                    <span>Updated {formattedDate}</span>
                </div>
                
                <div className="card-actions" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(collection._id);
                        }}
                        className="btn-danger"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                    >
                        Delete
                    </button>
                    <div className="open-arrow" style={{ color: 'var(--primary-color)', opacity: 0.5, transition: 'all 0.3s' }}>
                         <ChevronRight size={18} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CollectionCard;
