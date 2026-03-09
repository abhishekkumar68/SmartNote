import React from 'react';
import { useNavigate } from 'react-router-dom';

const CollectionCard = ({ collection, onDelete }) => {
    const navigate = useNavigate();

    return (
        <div className="card collection-card" onClick={() => navigate(`/collections/${collection._id}`)} style={{ cursor: 'pointer' }}>
            <div className="card-header">
                <h3 style={{ margin: 0, color: 'var(--primary-color)' }}>{collection.title}</h3>
            </div>
            <p className="card-desc">{collection.description}</p>
            <div className="card-actions">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(collection._id);
                    }}
                    className="btn-danger">Delete</button>
            </div>
        </div>
    );
};

export default CollectionCard;
