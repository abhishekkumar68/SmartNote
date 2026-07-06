import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import ResourceCard from '../components/ResourceCard';
import EmptyState from '../components/EmptyState';
import { Layers, ArrowLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const AUTO_TAG_MAP = {
    "array": ["DSA", "Array", "Data Structure"],
    "tree": ["DSA", "Tree", "Data Structure"],
    "sql": ["DBMS", "SQL"],
    "dbms": ["DBMS", "Database"],
    "os": ["OS", "Operating System"],
    "react": ["Frontend", "React"],
    "node": ["Backend", "Node.js"],
    "api": ["Backend", "API"]
};

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
    const navigate = useNavigate();
    const [resources, setResources] = useState([]);
    const [filteredResources, setFilteredResources] = useState([]);
    const [loading, setLoading] = useState(true);

    // Tag filtering & search states
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTag, setActiveTag] = useState(null);
    const [activeStatus, setActiveStatus] = useState('All');
    const [activeType, setActiveType] = useState('All');
    const [allTags, setAllTags] = useState([]);
    const [learningMode, setLearningMode] = useState(() => {
        try {
            const savedModes = JSON.parse(localStorage.getItem('collectionLearningModes') || '{}');
            return savedModes[id] || 'Standard';
        } catch { return 'Standard'; }
    });

    useEffect(() => {
        try {
            const savedModes = JSON.parse(localStorage.getItem('collectionLearningModes') || '{}');
            setLearningMode(savedModes[id] || 'Standard');
        } catch { }
    }, [id]);

    const updateLearningMode = (e) => {
        const mode = e.target.value;
        setLearningMode(mode);
        try {
            const savedModes = JSON.parse(localStorage.getItem('collectionLearningModes') || '{}');
            if (mode === 'Standard') {
                delete savedModes[id];
            } else {
                savedModes[id] = mode;
            }
            localStorage.setItem('collectionLearningModes', JSON.stringify(savedModes));
            window.dispatchEvent(new Event('dashboardModesUpdated'));
        } catch (err) { console.error(err); }
    };

    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        title: '', description: '', type: 'Article', tags: '', status: 'Not Started', rating: 0
    });

    const [suggestedTags, setSuggestedTags] = useState([]);

    // Auto tag suggestion logic
    useEffect(() => {
        const text = (formData.title + ' ' + formData.description).toLowerCase();
        const matches = new Set();
        Object.keys(AUTO_TAG_MAP).forEach(key => {
            if (text.includes(key)) {
                AUTO_TAG_MAP[key].forEach(tag => matches.add(tag));
            }
        });

        const existingTags = formData.tags ? formData.tags.split(',').map(t => t.trim().toLowerCase()) : [];
        const filteredMatches = Array.from(matches).filter(tag => !existingTags.includes(tag.toLowerCase()));

        setSuggestedTags(filteredMatches);
    }, [formData.title, formData.description, formData.tags]);

    const handleAddSuggestedTag = (tag) => {
        const currentTags = formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(t => t) : [];
        if (!currentTags.find(t => t.toLowerCase() === tag.toLowerCase())) {
            currentTags.push(tag);
            setFormData({ ...formData, tags: currentTags.join(', ') });
        }
    };

    const [collectionTitle, setCollectionTitle] = useState('');

    useEffect(() => {
        fetchCollectionDetails();
        fetchResources();
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

        if (learningMode === 'Revision') {
            filtered = filtered.filter(r => r.status !== 'Completed' || (r.rating > 0 && r.rating <= 3));
        } else if (learningMode === 'Learning') {
            filtered = filtered.filter(r => r.status === 'Not Started' || r.status === 'In Progress');
        }

        setFilteredResources(filtered);
    }, [resources, searchQuery, activeTag, activeStatus, activeType, learningMode]);

    const fetchResources = async () => {
        setLoading(true);
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
        } finally {
            setLoading(false);
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '500' }}>
                        <button 
                            onClick={() => navigate(-1)} 
                            style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.4rem', borderRadius: '8px', color: 'var(--text-color)', transition: 'all 0.2s', marginRight: '0.5rem', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }} 
                            onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--primary-color)'; e.currentTarget.style.color = 'var(--primary-color)'; }} 
                            onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-color)'; }}
                            title="Go Back"
                        >
                            <ArrowLeft size={16} strokeWidth={2.5} />
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                            <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onClick={() => navigate('/collections')} onMouseOver={e => e.target.style.color = 'var(--primary-color)'} onMouseOut={e => e.target.style.color = ''}>Collections</span>
                            <ChevronRight size={14} style={{ color: '#9ca3af', marginTop: '2px' }} />
                            <span style={{ color: 'var(--primary-color)', fontWeight: '600' }}>{collectionTitle || 'Loading...'}</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                        <h2 style={{ margin: 0 }}>Collection Resources</h2>
                        <select
                            value={learningMode}
                            onChange={updateLearningMode}
                            style={{
                                padding: '0.3rem 0.75rem',
                                background: learningMode === 'Revision' ? 'linear-gradient(135deg, #ef4444, #f97316)' : learningMode === 'Learning' ? 'linear-gradient(135deg, #3b82f6, #06b6d4)' : 'var(--bg-color)',
                                color: learningMode !== 'Standard' ? 'white' : 'var(--text-color)',
                                border: `1px solid ${learningMode !== 'Standard' ? 'transparent' : 'var(--border-color)'}`,
                                borderRadius: '999px',
                                fontWeight: 'bold',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                outline: 'none',
                                transition: 'all 0.2s',
                                boxShadow: learningMode === 'Revision' ? '0 4px 12px rgba(239, 68, 68, 0.3)' : learningMode === 'Learning' ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none'
                            }}
                        >
                            <option value="Standard" style={{ color: 'black' }}>Standard Mode</option>
                            <option value="Learning" style={{ color: 'black' }}>📚 Learning Mode</option>
                            <option value="Revision" style={{ color: 'black' }}>🔥 Revision Mode</option>
                        </select>
                    </div>
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

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <input type="text" name="tags" placeholder="Tags (comma separated)" value={formData.tags} onChange={handleChange} className="form-input" />
                        {suggestedTags.length > 0 && (
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', marginTop: '0.2rem' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Suggested:</span>
                                {suggestedTags.map(tag => (
                                    <motion.button
                                        key={tag}
                                        type="button"
                                        onClick={() => handleAddSuggestedTag(tag)}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="tag smart-tag"
                                        style={{ background: 'rgba(79, 70, 229, 0.1)', cursor: 'pointer', border: '1px dashed var(--primary-color)', padding: '0.1rem 0.5rem', fontSize: '0.7rem' }}
                                    >
                                        + {tag}
                                    </motion.button>
                                ))}
                            </div>
                        )}
                    </div>
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
                {loading ? (
                    [1, 2, 3].map(i => (
                        <div key={i} className="card" style={{ minHeight: '140px', opacity: 0.5, animation: 'pulse 1.5s ease-in-out infinite' }}>
                            <div style={{ height: '1rem', background: 'var(--border-color)', borderRadius: '4px', marginBottom: '0.75rem', width: '65%' }} />
                            <div style={{ height: '0.75rem', background: 'var(--border-color)', borderRadius: '4px', width: '85%', marginBottom: '0.5rem' }} />
                            <div style={{ height: '0.75rem', background: 'var(--border-color)', borderRadius: '4px', width: '50%' }} />
                        </div>
                    ))
                ) : (
                    <>
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
                            <div style={{ gridColumn: '1 / -1' }}>
                                <EmptyState
                                    title="No resources found"
                                    message={learningMode === 'Revision' ? "You have no weak or incomplete resources matching this filter." : learningMode === 'Learning' ? "You have no pending or new resources to learn." : "Start tracking your learning by adding your first resource to this collection."}
                                    icon={Layers}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ResourcePage;
