import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';

const ResourceDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [resource, setResource] = useState(null);
    const [collectionTitle, setCollectionTitle] = useState('');

    const [selectedItem, setSelectedItem] = useState(null); // For "Read More" Modal
    const [editingItem, setEditingItem] = useState(null); // Explicit state for the Edit modal payload

    const [fileOptions, setFileOptions] = useState(null);
    const [formData, setFormData] = useState({
        type: 'Text Note',
        title: '',
        content: '',
        link: ''
    });

    const [editFileOptions, setEditFileOptions] = useState(null);
    const [editFormData, setEditFormData] = useState({
        title: '',
        content: '',
        link: ''
    });

    const fetchResource = async () => {
        try {
            const { data } = await API.get(`/resources/single/${id}`);
            setResource(data);
            if (data.collectionId && data.collectionId.title) {
                setCollectionTitle(data.collectionId.title);
            }
        } catch (err) {
            console.error('Error fetching resource details:', err);
        }
    };

    useEffect(() => {
        fetchResource();
    }, [id]);

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFileOptions(e.target.files[0]);
    };

    const handleAddItem = async (e) => {
        e.preventDefault();

        try {
            const payload = new FormData();
            payload.append('type', formData.type);
            payload.append('title', formData.title);

            if (formData.type === 'Text Note' || formData.type === 'Article') {
                payload.append('content', formData.content);
            } else if (formData.type === 'Question Link') {
                payload.append('link', formData.link);
            } else if (fileOptions) {
                payload.append('file', fileOptions);
            }

            await API.post(`/resources/${id}/items`, payload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setFormData({ type: 'Text Note', title: '', content: '', link: '' });
            setFileOptions(null);
            const fileInput = document.getElementById("item-file-upload");
            if (fileInput) fileInput.value = "";
            fetchResource();
        } catch (err) {
            console.error('Error adding learning item:', err);
            alert('Failed to add learning item.');
        }
    };

    const handleDeleteItem = async (itemId) => {
        if (!window.confirm("Delete this learning item?")) return;
        try {
            await API.delete(`/resources/${id}/items/${itemId}`);
            fetchResource();
        } catch (err) {
            console.error('Error deleting item', err);
        }
    };

    const handleEditClick = (item) => {
        setEditingItem(item);
        setEditFormData({
            title: item.title || '',
            content: item.content || '',
            link: item.link || ''
        });
        setEditFileOptions(null);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = new FormData();
            payload.append('title', editFormData.title);

            if (editingItem.type === 'Text Note' || editingItem.type === 'Article') {
                payload.append('content', editFormData.content);
            } else if (editingItem.type === 'Question Link') {
                payload.append('link', editFormData.link);
            }

            if (editFileOptions) {
                payload.append('file', editFileOptions);
            }

            await API.put(`/resources/${id}/items/${editingItem._id}`, payload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setEditingItem(null);
            setEditFileOptions(null);
            fetchResource();
        } catch (err) {
            console.error('Error updating item:', err);
            alert('Failed to update learning item.');
        }
    };

    if (!resource) return <div style={{ padding: '2rem' }}>Loading resource details...</div>;

    return (
        <div>
            <div className="page-header" style={{ flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: '500' }}>
                        <span style={{ cursor: 'pointer' }} onClick={() => navigate('/collections')}>Collections</span>
                        &gt;
                        <span style={{ cursor: 'pointer' }} onClick={() => navigate(`/collections/${resource.collectionId?._id}`)}>
                            {' '} {collectionTitle || 'Loading...'}
                        </span>
                        &gt; {resource.title}
                    </div>
                    <h2 style={{ margin: 0 }}>{resource.title} Detailed Knowledge</h2>
                </div>
            </div>

            <div className="card" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--primary-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h3 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {resource.title}
                            <span className="badge status-in-progress" style={{ fontSize: '0.7rem' }}>{resource.status}</span>
                        </h3>
                        <p style={{ color: '#6b7280', margin: '0 0 1rem 0' }}>{resource.description || 'No description provided.'}</p>
                    </div>
                </div>

                {resource.rating > 0 && (
                    <div style={{ color: '#fbbf24', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-color)', fontWeight: 'bold' }}>Learning Value:</span>
                        <span>{'★'.repeat(resource.rating)}{'☆'.repeat(5 - resource.rating)}</span>
                    </div>
                )}

                {resource.tags && resource.tags.length > 0 && (
                    <div className="resource-tags" style={{ marginBottom: 0 }}>
                        {resource.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
                    </div>
                )}
            </div>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Add Learning Item</h3>
                <form onSubmit={handleAddItem} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 2fr', gap: '1rem' }}>
                        <select name="type" value={formData.type} onChange={handleFormChange} className="form-input">
                            <option value="Text Note">Text Note</option>
                            <option value="Question Link">Link</option>
                            <option value="File / Image Upload">File / Image Upload</option>
                            <option value="Article">Article</option>
                        </select>
                        <input type="text" name="title" value={formData.title} onChange={handleFormChange} placeholder="Item Title (e.g. Concept explanation)" required className="form-input" />
                    </div>

                    {formData.type === 'Text Note' && (
                        <textarea name="content" value={formData.content} onChange={handleFormChange} placeholder="Write your text notes here..." required className="form-input" rows="4" />
                    )}

                    {formData.type === 'Article' && (
                        <textarea name="content" value={formData.content} onChange={handleFormChange} placeholder="Write your long-form article..." required className="form-input" rows="12" />
                    )}

                    {formData.type === 'Question Link' && (
                        <input type="url" name="link" value={formData.link} onChange={handleFormChange} placeholder="https://leetcode.com/..." required className="form-input" />
                    )}

                    {(formData.type === 'File / Image Upload') && (
                        <div style={{ padding: '2rem', border: '2px dashed var(--border-color)', borderRadius: '8px', textAlign: 'center', background: 'var(--bg-color)' }}>
                            <input type="file" id="item-file-upload" onChange={handleFileChange} required accept="*" />
                        </div>
                    )}

                    <div>
                        <button type="submit" className="btn-primary" style={{ padding: '0.75rem 2rem' }}>Add Item</button>
                    </div>
                </form>
            </div>

            <h3 style={{ marginBottom: '1rem' }}>Learning Items</h3>
            {resource.learningItems && resource.learningItems.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', alignItems: 'stretch' }}>
                    {resource.learningItems.map(item => {
                        let isImage = false;
                        if (item.fileUrl) {
                            const ext = item.fileUrl.split('.').pop().toLowerCase();
                            isImage = ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext);
                        }

                        // Determine Icon
                        let ItemIcon = '📄';
                        if (item.type === 'Question Link') ItemIcon = '🔗';
                        else if (item.type === 'File / Image Upload' && isImage) ItemIcon = '🖼️';
                        else if (item.type === 'File / Image Upload') ItemIcon = '📁';
                        else if (item.type === 'Article') ItemIcon = '📰';

                        return (
                            <div key={item._id} className="card learning-item-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <span>{ItemIcon}</span> {item.type}
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={() => handleEditClick(item)} className="btn-edit" style={{ padding: '0.1rem 0.4rem', fontSize: '0.75rem', height: 'fit-content' }}>Edit</button>
                                        <button onClick={() => handleDeleteItem(item._id)} className="btn-danger" style={{ padding: '0.1rem 0.6rem', fontSize: '0.75rem', height: 'fit-content' }}>X</button>
                                    </div>
                                </div>
                                <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>{item.title}</h4>

                                <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                    {(item.type === 'Text Note' || item.type === 'Article') && (
                                        <>
                                            <div className="line-clamp-4" style={{ whiteSpace: 'pre-wrap', color: 'var(--text-color)', fontSize: '0.95rem', marginBottom: '1rem' }}>
                                                {item.content}
                                            </div>
                                            <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
                                                <button onClick={() => setSelectedItem(item)} className="btn-primary" style={{ fontSize: '0.85rem', background: 'transparent', color: 'var(--primary-color)', border: '1px solid var(--primary-color)', width: '100%' }}>
                                                    Read More
                                                </button>
                                            </div>
                                        </>
                                    )}

                                    {item.type === 'Question Link' && (
                                        <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                                            <a href={item.link} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ display: 'block', textAlign: 'center', fontSize: '0.85rem' }}>
                                                Open Link
                                            </a>
                                        </div>
                                    )}

                                    {item.type === 'File / Image Upload' && isImage && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: 'auto' }}>
                                            <div style={{ width: '100%', height: '150px', backgroundColor: '#f3f4f6', borderRadius: '8px', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                <img src={`http://localhost:5000${item.fileUrl}`} alt={item.originalName} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <a href={`http://localhost:5000${item.fileUrl}`} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ flex: 1, textAlign: 'center', fontSize: '0.85rem' }}>View</a>
                                                <a href={`http://localhost:5000${item.fileUrl}`} download className="btn-primary" style={{ flex: 1, backgroundColor: 'var(--secondary-color)', textAlign: 'center', fontSize: '0.85rem' }}>Download</a>
                                            </div>
                                        </div>
                                    )}

                                    {item.type === 'File / Image Upload' && !isImage && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: 'auto' }}>
                                            <div style={{ padding: '1rem', backgroundColor: 'rgba(79, 70, 229, 0.05)', borderRadius: '8px', wordBreak: 'break-all', fontSize: '0.85rem', color: 'var(--primary-color)', textAlign: 'center' }}>
                                                📁 {item.originalName}
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <a href={`http://localhost:5000${item.fileUrl}`} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ flex: 1, textAlign: 'center', fontSize: '0.85rem' }}>Open</a>
                                                <a href={`http://localhost:5000${item.fileUrl}`} download className="btn-primary" style={{ flex: 1, backgroundColor: 'var(--secondary-color)', textAlign: 'center', fontSize: '0.85rem' }}>Download</a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--card-bg)', borderRadius: '12px', border: '1px dashed var(--border-color)', color: '#6b7280' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0' }}>No Learning Items Yet</h4>
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>Add notes, external links, or upload files and images to track your knowledge on {resource.title}.</p>
                </div>
            )}

            {/* Read More Modal */}
            {selectedItem && (
                <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--primary-color)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                            {selectedItem.title}
                        </h3>
                        <div style={{ whiteSpace: 'pre-wrap', color: 'var(--text-color)', lineHeight: '1.6' }}>
                            {selectedItem.content}
                        </div>
                        <div style={{ marginTop: '2rem', textAlign: 'right' }}>
                            <button onClick={() => setSelectedItem(null)} className="btn-primary" style={{ backgroundColor: 'var(--danger-color)' }}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Learning Item Modal */}
            {editingItem && (
                <div className="modal-overlay" onClick={() => { setEditingItem(null); setEditFileOptions(null); }}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--primary-color)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                            Edit {editingItem.type}
                        </h3>

                        <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Title</label>
                                <input type="text" value={editFormData.title} onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })} required className="form-input" />
                            </div>

                            {(editingItem.type === 'Text Note') && (
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label>Content</label>
                                    <textarea value={editFormData.content} onChange={(e) => setEditFormData({ ...editFormData, content: e.target.value })} required className="form-input" rows="5" />
                                </div>
                            )}

                            {(editingItem.type === 'Article') && (
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label>Article Content</label>
                                    <textarea value={editFormData.content} onChange={(e) => setEditFormData({ ...editFormData, content: e.target.value })} required className="form-input" rows="12" />
                                </div>
                            )}

                            {(editingItem.type === 'Question Link') && (
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label>URL Link</label>
                                    <input type="url" value={editFormData.link} onChange={(e) => setEditFormData({ ...editFormData, link: e.target.value })} required className="form-input" />
                                </div>
                            )}

                            {(editingItem.type === 'File / Image Upload') && (
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label>Replace File (Optional)</label>
                                    <div style={{ padding: '1rem', border: '2px dashed var(--border-color)', borderRadius: '8px', textAlign: 'center', background: 'var(--bg-color)' }}>
                                        <input type="file" onChange={(e) => setEditFileOptions(e.target.files[0])} accept="*" />
                                        <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#6b7280' }}>Current file: {editingItem.originalName}</div>
                                    </div>
                                </div>
                            )}

                            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                <button type="button" onClick={() => { setEditingItem(null); setEditFileOptions(null); }} className="btn-danger" style={{ padding: '0.5rem 1rem' }}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1.5rem' }}>
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResourceDetailPage;
