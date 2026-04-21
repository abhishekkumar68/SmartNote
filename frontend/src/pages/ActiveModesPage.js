import React, { useState, useEffect } from 'react';
import API from '../services/api';
import ResourceCard from '../components/ResourceCard';
import EmptyState from '../components/EmptyState';
import { Layers } from 'lucide-react';
import { motion } from 'framer-motion';

const ActiveModesPage = () => {
    const [allResources, setAllResources] = useState([]);
    
    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        try {
            const { data } = await API.get('/resources');
            setAllResources(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (resourceId) => {
        try {
            await API.delete(`/resources/${resourceId}`);
            fetchResources();
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdateStatus = async (resourceId, status) => {
        try {
            await API.put(`/resources/${resourceId}`, { status });
            fetchResources();
        } catch (err) {
            console.error(err);
        }
    };

    const handleToggleBookmark = async (resourceId, currentStatus) => {
        try {
            if (currentStatus) await API.post(`/bookmarks/${resourceId}`);
            else await API.delete(`/bookmarks/${resourceId}`);
            fetchResources();
        } catch (err) {
            console.error(err);
        }
    };

    const savedModes = JSON.parse(localStorage.getItem('collectionLearningModes') || '{}');
    const learningResources = allResources.filter(r => {
        const cid = r.collectionId?._id || r.collectionId;
        return savedModes[cid] === 'Learning';
    });
    const revisionResources = allResources.filter(r => {
        const cid = r.collectionId?._id || r.collectionId;
        return savedModes[cid] === 'Revision';
    });

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{ paddingBottom: '2rem' }}
        >
            <div className="page-header" style={{ marginBottom: '2rem' }}>
                <h2>Active Mode Resources</h2>
            </div>

            {learningResources.length === 0 && revisionResources.length === 0 && (
                <EmptyState
                    title="No pending resources found"
                    message="You have no active learning or revision mode resources pending action."
                    icon={Layers}
                />
            )}

            {learningResources.length > 0 && (
                <div style={{ marginBottom: '3rem' }}>
                    <h3 className="section-title" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.4rem' }}>📚</span> Learning Mode Resources
                    </h3>
                    <div className="resource-grid">
                        {learningResources.map(resource => (
                            <ResourceCard
                                key={resource._id}
                                resource={resource}
                                onDelete={handleDelete}
                                onUpdateStatus={handleUpdateStatus}
                                onToggleBookmark={handleToggleBookmark}
                            />
                        ))}
                    </div>
                </div>
            )}

            {revisionResources.length > 0 && (
                <div style={{ marginBottom: '3rem' }}>
                    <h3 className="section-title" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.4rem' }}>🔥</span> Revision Mode Resources
                    </h3>
                    <div className="resource-grid">
                        {revisionResources.map(resource => (
                            <ResourceCard
                                key={resource._id}
                                resource={resource}
                                onDelete={handleDelete}
                                onUpdateStatus={handleUpdateStatus}
                                onToggleBookmark={handleToggleBookmark}
                            />
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default ActiveModesPage;
