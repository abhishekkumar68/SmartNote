import React, { useState, useEffect } from 'react';
import API from '../services/api';
import ResourceCard from '../components/ResourceCard';

const Bookmarks = () => {
    const [resources, setResources] = useState([]);

    useEffect(() => {
        fetchBookmarks();
    }, []);

    const fetchBookmarks = async () => {
        try {
            const { data } = await API.get('/bookmarks');
            setResources(data);
        } catch (error) {
            console.error(error);
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
                {resources.map(resource => (
                    <ResourceCard
                        key={resource._id}
                        resource={resource}
                        onDelete={handleDelete}
                        onUpdateStatus={handleUpdateStatus}
                        onToggleBookmark={handleToggleBookmark}
                    />
                ))}
                {resources.length === 0 && <p>No bookmarked resources found.</p>}
            </div>
        </div>
    );
};

export default Bookmarks;
