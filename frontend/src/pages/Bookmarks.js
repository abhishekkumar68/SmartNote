import React, { useState, useEffect } from 'react';
import API from '../services/api';
import ResourceCard from '../components/ResourceCard';
import EmptyState from '../components/EmptyState';
import { Bookmark } from 'lucide-react';

const Bookmarks = () => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBookmarks();
    }, []);

    const fetchBookmarks = async () => {
        setLoading(true);
        try {
            const { data } = await API.get('/bookmarks');
            setResources(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await API.delete(`/resources/${id}`);
            fetchBookmarks();
        } catch (error) {
            console.error(error);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            await API.put(`/resources/${id}`, { status });
            fetchBookmarks();
        } catch (error) {
            console.error(error);
        }
    };

    const handleToggleBookmark = async (id, status) => {
        try {
            if (status) {
                await API.post(`/bookmarks/${id}`);
            } else {
                await API.delete(`/bookmarks/${id}`);
            }
            fetchBookmarks();
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div>
            <div className="page-header">
                <h2>Bookmarked Resources</h2>
            </div>
            <div className="resource-grid">
                {loading ? (
                    [1, 2, 3].map(i => (
                        <div key={i} className="card" style={{ minHeight: '140px', opacity: 0.5, animation: 'pulse 1.5s ease-in-out infinite' }}>
                            <div style={{ height: '1rem', background: 'var(--border-color)', borderRadius: '4px', marginBottom: '0.75rem', width: '70%' }} />
                            <div style={{ height: '0.75rem', background: 'var(--border-color)', borderRadius: '4px', width: '90%' }} />
                        </div>
                    ))
                ) : (
                    <>
                        {resources.map(resource => (
                            <ResourceCard
                                key={resource._id}
                                resource={resource}
                                onDelete={handleDelete}
                                onUpdateStatus={handleUpdateStatus}
                                onToggleBookmark={handleToggleBookmark}
                            />
                        ))}
                        {resources.length === 0 && (
                            <div style={{ gridColumn: '1 / -1' }}>
                                <EmptyState 
                                    title="No bookmarks yet" 
                                    message="Resources you bookmark will appear here for quick access later."
                                    icon={Bookmark}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Bookmarks;
