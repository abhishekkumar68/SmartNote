import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import API from '../services/api';
import ResourceCard from '../components/ResourceCard';

// Helper component for Star Rating
const StarRatingInput = ({ rating, setRating }) => {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '500', marginRight: '0.5rem' }}>Quality:</span>
            {[1, 2, 3, 4, 5].map((star) => (
                <span
                    key={star}
                    onClick={() => setRating(star)}
                    style={{
                        cursor: 'pointer',
                        fontSize: '1.5rem',
                        color: star <= rating ? '#fbbf24' : '#d1d5db',
                        transition: 'color 0.2s'
                    }}
                >
                    ★
                </span>
            ))}
        </div>
    );
};

const ResourcePage = () => {
    const { id } = useParams();
    const [resources, setResources] = useState([]);
    const [filteredResources, setFilteredResources] = useState([]);

    // Tag filtering & search states
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTag, setActiveTag] = useState(null);
    const [activeStatus, setActiveStatus] = useState('All');
    const [activeType, setActiveType] = useState('All');
    const [allTags, setAllTags] = useState([]);

    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        title: '', description: '', type: 'Article', tags: '', status: 'Not Started', rating: 0
    });

    const [collectionTitle, setCollectionTitle] = useState('');

    useEffect(() => {
        fetchCollectionDetails();
        fetchResources();
    }, [id]);

    const fetchCollectionDetails = async () => {
        try {
            const { data } = await API.get(`/collections/${id}`);
            setCollectionTitle(data.title);
        } catch (err) {
            console.error('Error fetching collection:', err);
        }
    };

    useEffect(() => {
        let filtered = resources;

        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            filtered = filtered.filter(r =>
                (r.title && r.title.toLowerCase().includes(lowerQuery)) ||
                (r.description && r.description.toLowerCase().includes(lowerQuery)) ||
                (r.tags && r.tags.some(t => t.toLowerCase().includes(lowerQuery)))
            );
        }

        if (activeTag) {
            filtered = filtered.filter(r => r.tags && r.tags.includes(activeTag));
        }

        if (activeStatus !== 'All') {
            filtered = filtered.filter(r => r.status === activeStatus);
        }

        if (activeType !== 'All') {
            filtered = filtered.filter(r => r.type === activeType);
        }

        setFilteredResources(filtered);
    }, [resources, searchQuery, activeTag, activeStatus, activeType]);

    const fetchResources = async () => {
        try {
            const { data } = await API.get(`/resources/${id}`);
            setResources(data);

            // Extract all unique tags
            const tagsSet = new Set();
            data.forEach(r => {
                if (r.tags) r.tags.forEach(t => tagsSet.add(t));
            });
            setAllTags(Array.from(tagsSet));
        } catch (err) {
            console.error(err);
        }
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const startEdit = (resource) => {
        setEditingId(resource._id);
        setFormData({
            title: resource.title || '',
            description: resource.description || '',
            type: resource.type || 'Article',
            tags: resource.tags ? resource.tags.join(', ') : '',
            status: resource.status || 'Not Started',
            rating: resource.rating || 0
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setFormData({ title: '', description: '', type: 'Article', tags: '', status: 'Not Started', rating: 0 });
    };

    const handleCreateOrUpdate = async (e) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            alert('Title is required.');
            return;
        }

        try {
            const payload = {
                title: formData.title,
                description: formData.description,
                type: formData.type,
                status: formData.status,
                rating: formData.rating,
                collectionId: id
            };

            // Append parsed tags string strictly
            if (formData.tags) {
                payload.tags = formData.tags.split(',').map(t => t.trim()).filter(t => t);
            }

            if (editingId) {
                await API.put(`/resources/${editingId}`, payload);
                setEditingId(null);
            } else {
                await API.post('/resources', payload);
            }

            setFormData({ title: '', description: '', type: 'Article', tags: '', status: 'Not Started', rating: 0 });
            fetchResources();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Error occurred while saving the resource.');
        }
    };

    const handleDelete = async (resourceId) => {
        if (!window.confirm("Are you sure you want to delete this resource?")) return;
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
            if (currentStatus) {
                await API.post(`/bookmarks/${resourceId}`);
            } else {
                await API.delete(`/bookmarks/${resourceId}`);
            }
            fetchResources();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div>
            <div className="page-header" style={{ flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: '500' }}>
                        <span style={{ cursor: 'pointer' }} onClick={() => window.history.back()}>Collections</span> &gt; {collectionTitle || 'Loading...'}
                    </div>
                    <h2 style={{ margin: 0 }}>Collection Resources</h2>
                </div>

                {/* Embedded Collection Search */}
                <div style={{ display: 'flex', gap: '0.5rem', width: '300px' }}>
                    <input
                        type="text"
                        placeholder="Search collection..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="form-input"
                        style={{ borderRadius: '999px', padding: '0.5rem 1rem' }}
                    />
                </div>
            </div>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <h3>{editingId ? 'Edit Resource' : 'Add Resource'}</h3>
                <form onSubmit={handleCreateOrUpdate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                    <input type="text" name="title" placeholder="Title" value={formData.title} onChange={handleChange} required className="form-input" />
                    <input type="text" name="tags" placeholder="Tags (comma separated)" value={formData.tags} onChange={handleChange} className="form-input" />
                    <select name="type" value={formData.type} onChange={handleChange} className="form-input">
                        <option value="Article">Article</option>
                        <option value="Video">Video</option>
                        <option value="Course">Course</option>
                        <option value="GitHub">GitHub</option>
                        <option value="Notes">Notes</option>
                    </select>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <select name="status" value={formData.status} onChange={handleChange} className="form-input" style={{ flexGrow: 1 }}>
                            <option value="Not Started">Not Started</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                        </select>
                        <StarRatingInput rating={formData.rating} setRating={(val) => setFormData({ ...formData, rating: val })} />
                    </div>

                    <div className="form-group" style={{ gridColumn: 'span 2', marginBottom: 0 }}>
                        <textarea name="description" placeholder="Description..." value={formData.description} onChange={handleChange} className="form-input" rows="2" />
                    </div>

                    <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button type="submit" className="btn-primary" style={{ flexGrow: 1, padding: '0.75rem' }}>{editingId ? 'Update Resource' : 'Create Resource'}</button>
                        {editingId && <button type="button" onClick={cancelEdit} className="btn-danger" style={{ padding: '0.75rem 1.5rem' }}>Cancel</button>}
                    </div>
                </form>
            </div>

            {/* Tag & Global Filters */}
            <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                {allTags.length > 0 && (
                    <div>
                        <h4 style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-color)' }}>Filter by Tags:</h4>
                        <div className="resource-tags" style={{ marginBottom: 0 }}>
                            <button
                                className={`tag ${activeTag === null ? 'active' : ''}`}
                                style={{ cursor: 'pointer', border: activeTag === null ? '1px solid var(--primary-color)' : 'none' }}
                                onClick={() => setActiveTag(null)}
                            >
                                All
                            </button>
                            {allTags.map(tag => (
                                <button
                                    key={tag}
                                    className={`tag ${activeTag === tag ? 'active' : ''}`}
                                    style={{ cursor: 'pointer', border: activeTag === tag ? '1px solid var(--primary-color)' : 'none' }}
                                    onClick={() => setActiveTag(tag)}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div>
                    <h4 style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-color)' }}>Filter by Status:</h4>
                    <select value={activeStatus} onChange={(e) => setActiveStatus(e.target.value)} className="form-input" style={{ width: 'max-content', padding: '0.25rem 0.5rem' }}>
                        <option value="All">All</option>
                        <option value="Not Started">Not Started</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                    </select>
                </div>

                <div>
                    <h4 style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-color)' }}>Filter by Type:</h4>
                    <select value={activeType} onChange={(e) => setActiveType(e.target.value)} className="form-input" style={{ width: 'max-content', padding: '0.25rem 0.5rem' }}>
                        <option value="All">All</option>
                        <option value="Article">Article</option>
                        <option value="Video">Video</option>
                        <option value="Course">Course</option>
                        <option value="GitHub">GitHub</option>
                        <option value="Notes">Notes</option>
                    </select>
                </div>
            </div>

            <div className="resource-grid">
                {filteredResources.map(resource => (
                    <ResourceCard
                        key={resource._id}
                        resource={resource}
                        onEdit={() => startEdit(resource)}
                        onDelete={handleDelete}
                        onUpdateStatus={handleUpdateStatus}
                        onToggleBookmark={handleToggleBookmark}
                    />
                ))}
                {filteredResources.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', marginTop: '3rem', color: 'var(--text-color)', padding: '3rem', background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No resources in this collection yet.</h3>
                        <p style={{ color: '#6b7280' }}>Start adding resources to track your learning.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResourcePage;
