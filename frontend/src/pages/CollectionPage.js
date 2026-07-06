import React, { useState, useEffect } from 'react';
import API from '../services/api';
import CollectionCard from '../components/CollectionCard';
import EmptyState from '../components/EmptyState';
import { Library } from 'lucide-react';

const CollectionPage = () => {
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        fetchCollections();
    }, []);

    const fetchCollections = async () => {
        setLoading(true);
        try {
            const { data } = await API.get('/collections');
            setCollections(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await API.post('/collections', { title, description });
            setTitle('');
            setDescription('');
            fetchCollections();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        try {
            await API.delete(`/collections/${id}`);
            fetchCollections();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div>
            <div className="page-header">
                <h2>My Collections</h2>
            </div>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <h3>Create New Collection</h3>
                <form onSubmit={handleCreate} style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <input
                        type="text"
                        placeholder="Title"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        required
                        style={{ flexGrow: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                    />
                    <input
                        type="text"
                        placeholder="Description"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        style={{ flexGrow: 2, padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                    />
                    <button type="submit" className="btn-primary">Create</button>
                </form>
            </div>

            <div className="collection-grid">
                {loading ? (
                    [1, 2, 3].map(i => (
                        <div key={i} className="card" style={{ minHeight: '120px', opacity: 0.5, animation: 'pulse 1.5s ease-in-out infinite' }}>
                            <div style={{ height: '1rem', background: 'var(--border-color)', borderRadius: '4px', marginBottom: '0.75rem', width: '60%' }} />
                            <div style={{ height: '0.75rem', background: 'var(--border-color)', borderRadius: '4px', width: '80%' }} />
                        </div>
                    ))
                ) : (
                    <>
                        {collections.map(collection => (
                            <CollectionCard
                                key={collection._id}
                                collection={collection}
                                onDelete={handleDelete}
                            />
                        ))}
                        {collections.length === 0 && (
                            <div style={{ gridColumn: '1 / -1' }}>
                                <EmptyState 
                                    title="No collections found" 
                                    message="Create your first collection above to start organizing your learning resources."
                                    icon={Library}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default CollectionPage;
