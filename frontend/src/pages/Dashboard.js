import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import SearchBar from '../components/SearchBar';
import ResourceCard from '../components/ResourceCard';

const COLORS = ['#10b981', '#4f46e5', '#f59e0b', '#ef4444'];
const TYPE_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#14b8a6', '#64748b'];

const Dashboard = () => {
    const [stats, setStats] = useState({
        total: 0,
        completed: 0,
        inProgress: 0,
        notStarted: 0,
        bookmarked: 0,
        avgLearningValue: 0,
        resourcesPerCollection: 0,
        mostUsedType: 'N/A'
    });
    const [typeData, setTypeData] = useState([]);

    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const [resourcesRes, collectionsRes] = await Promise.all([
                API.get('/resources'),
                API.get('/collections')
            ]);

            const data = resourcesRes.data;
            const collections = collectionsRes.data;

            const completed = data.filter(r => r.status === 'Completed').length;
            const inProgress = data.filter(r => r.status === 'In Progress').length;
            const notStarted = data.filter(r => r.status === 'Not Started').length;
            const bookmarked = data.filter(r => r.bookmarked).length;

            const typeCounts = data.reduce((acc, r) => {
                const type = r.type || 'Other';
                acc[type] = (acc[type] || 0) + 1;
                return acc;
            }, {});

            const typeChartData = Object.keys(typeCounts).map(key => ({
                name: key,
                count: typeCounts[key]
            })).sort((a, b) => b.count - a.count);

            const mostUsedType = typeChartData.length > 0 ? typeChartData[0].name : 'N/A';

            const ratedResources = data.filter(r => r.rating > 0);
            const avgLearningValue = ratedResources.length > 0
                ? (ratedResources.reduce((sum, r) => sum + r.rating, 0) / ratedResources.length).toFixed(1)
                : 0;

            const resourcesPerCollection = collections.length > 0
                ? (data.length / collections.length).toFixed(1)
                : 0;

            setStats({
                total: data.length,
                completed,
                inProgress,
                notStarted,
                bookmarked,
                avgLearningValue,
                resourcesPerCollection,
                mostUsedType
            });
            setTypeData(typeChartData);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSearch = async (query) => {
        if (!query) {
            setIsSearching(false);
            setSearchResults([]);
            return;
        }
        try {
            setIsSearching(true);
            const { data } = await API.get(`/resources/search?q=${query}`);
            setSearchResults(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (resourceId) => {
        try {
            await API.delete(`/resources/${resourceId}`);
            if (isSearching) {
                setSearchResults(searchResults.filter(r => r._id !== resourceId));
            }
            fetchStats();
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdateStatus = async (resourceId, status) => {
        try {
            await API.put(`/resources/${resourceId}`, { status });
            if (isSearching) {
                setSearchResults(searchResults.map(r => r._id === resourceId ? { ...r, status } : r));
            }
            fetchStats();
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
            if (isSearching) {
                setSearchResults(searchResults.map(r => r._id === resourceId ? { ...r, bookmarked: currentStatus } : r));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const data = [
        { name: 'Completed', value: stats.completed },
        { name: 'In Progress', value: stats.inProgress },
        { name: 'Not Started', value: stats.notStarted },
    ].filter(item => item.value > 0);

    return (
        <div className="dashboard">
            <div className="page-header">
                <h2>Learning Dashboard</h2>
            </div>

            <SearchBar onSearch={handleSearch} />

            {isSearching ? (
                <div className="search-results" style={{ marginTop: '2rem' }}>
                    <h3>Search Results</h3>
                    <div className="resource-grid">
                        {searchResults.map(resource => (
                            <ResourceCard
                                key={resource._id}
                                resource={resource}
                                onDelete={handleDelete}
                                onUpdateStatus={handleUpdateStatus}
                                onToggleBookmark={handleToggleBookmark}
                            />
                        ))}
                        {searchResults.length === 0 && <p>No resources found matching your search.</p>}
                    </div>
                </div>
            ) : (
                <>
                    <div className="collection-grid" style={{ marginBottom: '2rem', marginTop: '2rem' }}>
                        <div className="card" style={{ textAlign: 'center' }}>
                            <h3 style={{ fontSize: '1rem', color: '#6b7280' }}>Total Resources</h3>
                            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>{stats.total}</p>
                        </div>
                        <div className="card" style={{ textAlign: 'center' }}>
                            <h3 style={{ fontSize: '1rem', color: '#6b7280' }}>Completed</h3>
                            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--secondary-color)' }}>{stats.completed}</p>
                        </div>
                        <div className="card" style={{ textAlign: 'center' }}>
                            <h3 style={{ fontSize: '1rem', color: '#6b7280' }}>In Progress</h3>
                            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>{stats.inProgress}</p>
                        </div>
                        <div className="card" style={{ textAlign: 'center' }}>
                            <h3 style={{ fontSize: '1rem', color: '#6b7280' }}>Not Started</h3>
                            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#6b7280' }}>{stats.notStarted}</p>
                        </div>
                        <div className="card" style={{ textAlign: 'center' }}>
                            <h3 style={{ fontSize: '1rem', color: '#6b7280' }}>Bookmarked</h3>
                            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fbbf24' }}>{stats.bookmarked} ★</p>
                        </div>
                        <div className="card" style={{ textAlign: 'center' }}>
                            <h3 style={{ fontSize: '1rem', color: '#6b7280' }}>Avg. Learning Value</h3>
                            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>{stats.avgLearningValue} ★</p>
                        </div>
                        <div className="card" style={{ textAlign: 'center' }}>
                            <h3 style={{ fontSize: '1rem', color: '#6b7280' }}>Resources / Collection</h3>
                            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#14b8a6' }}>{stats.resourcesPerCollection}</p>
                        </div>
                        <div className="card" style={{ textAlign: 'center' }}>
                            <h3 style={{ fontSize: '1rem', color: '#6b7280' }}>Top Resource Type</h3>
                            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ec4899' }}>{stats.mostUsedType}</p>
                        </div>
                    </div>

                    {stats.total > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
                            <div className="card" style={{ height: 400 }}>
                                <h3 style={{ marginBottom: '1rem', textAlign: 'center' }}>Learning Progress</h3>
                                <ResponsiveContainer width="100%" height="80%">
                                    <PieChart>
                                        <Pie
                                            data={data}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        >
                                            {data.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => [value, 'Resources']} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="card" style={{ height: 400 }}>
                                <h3 style={{ marginBottom: '1rem', textAlign: 'center' }}>Resources By Type</h3>
                                <ResponsiveContainer width="100%" height="80%">
                                    <BarChart
                                        data={typeData}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                        <XAxis dataKey="name" />
                                        <YAxis allowDecimals={false} />
                                        <Tooltip formatter={(value) => [value, 'Count']} cursor={{ fill: 'rgba(79, 70, 229, 0.1)' }} />
                                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                            {typeData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={TYPE_COLORS[index % TYPE_COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    ) : (
                        <div className="card">
                            <p>No resources found. Create a collection and add some resources to see your learning stats!</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Dashboard;
