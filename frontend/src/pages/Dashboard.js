import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Library, CheckCircle2, Clock, CircleDashed, Bookmark, Star, PieChart as PieChartIcon } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import ResourceCard from '../components/ResourceCard';
import StatCard from '../components/Dashboard/StatCard';
import LearningHeatmap from '../components/Dashboard/LearningHeatmap';
import { motion } from 'framer-motion';
import EmptyState from '../components/EmptyState';
import './Dashboard.css';

const COLORS = ['#10b981', '#f59e0b', '#64748b']; // Success (Green) for Progress only
const TYPE_COLORS = ['#8b5cf6', '#6366f1', '#a855f7', '#d946ef', '#3b82f6']; // Purple gradients for category

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [allResources, setAllResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        completed: 0,
        inProgress: 0,
        notStarted: 0,
        bookmarked: 0,
        avgLearningValue: 0,
        mostUsedType: 'N/A'
    });
    const [typeData, setTypeData] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const { data } = await API.get('/resources');
            setAllResources(data);

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

            setStats({
                total: data.length,
                completed,
                inProgress,
                notStarted,
                bookmarked,
                avgLearningValue,
                mostUsedType
            });
            setTypeData(typeChartData);
        } catch (err) {
            console.error('Error fetching stats:', err);
        } finally {
            setLoading(false);
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
            if (isSearching) setSearchResults(searchResults.filter(r => r._id !== resourceId));
            fetchStats();
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdateStatus = async (resourceId, status) => {
        try {
            await API.put(`/resources/${resourceId}`, { status });
            if (isSearching) setSearchResults(searchResults.map(r => r._id === resourceId ? { ...r, status } : r));
            fetchStats();
        } catch (err) {
            console.error(err);
        }
    };

    const handleToggleBookmark = async (resourceId, currentStatus) => {
        try {
            if (currentStatus) await API.post(`/bookmarks/${resourceId}`);
            else await API.delete(`/bookmarks/${resourceId}`);
            if (isSearching) setSearchResults(searchResults.map(r => r._id === resourceId ? { ...r, bookmarked: currentStatus } : r));
        } catch (err) {
            console.error(err);
        }
    };

    const pieData = [
        { name: 'Completed', value: stats.completed },
        { name: 'In Progress', value: stats.inProgress },
        { name: 'Not Started', value: stats.notStarted },
    ].filter(item => item.value > 0);

    const greeting = user?.username || user?.name || 'Developer';

    const [activeModesCount, setActiveModesCount] = useState({ learning: 0, revision: 0 });

    const fetchModesCount = () => {
        try {
            const savedModes = JSON.parse(localStorage.getItem('collectionLearningModes') || '{}');
            let l = 0;
            let r = 0;
            Object.values(savedModes).forEach(mode => {
                if (mode === 'Learning') l++;
                if (mode === 'Revision') r++;
            });
            setActiveModesCount({ learning: l, revision: r });
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchModesCount();
        window.addEventListener('dashboardModesUpdated', fetchModesCount);
        return () => window.removeEventListener('dashboardModesUpdated', fetchModesCount);
    }, []);

    const clearAllModes = () => {
        localStorage.removeItem('collectionLearningModes');
        setActiveModesCount({ learning: 0, revision: 0 });
    };

    const hour = new Date().getHours();
    const timeGreeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

    let motivationCopy = `Ready to continue learning?`;
    if (stats.inProgress > 0) {
        const inProgressItems = allResources.filter(r => r.status === 'In Progress');
        if (inProgressItems.length === 1) {
            motivationCopy = `You have 1 pending resource: "${inProgressItems[0].title}". Continue learning.`;
        } else if (inProgressItems.length > 1) {
            const titles = inProgressItems.slice(0, 2).map(r => `"${r.title}"`).join(' and ');
            motivationCopy = `You have ${stats.inProgress} pending resources, including ${titles}. Continue learning.`;
        } else {
            motivationCopy = `You have ${stats.inProgress} pending resources. Continue learning.`;
        }
    } else if (stats.completed > 0) {
        motivationCopy = `You completed ${stats.completed} resources this week.`;
    } else if (stats.notStarted > 0) {
        motivationCopy = `You have ${stats.notStarted} pending resources. Continue learning.`;
    }

    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const suggestedResources = allResources.filter(r => {
        if (r.status === 'Completed') return false; 
        if (!r.lastAccessedAt || new Date(r.lastAccessedAt) < threeDaysAgo) return true;
        if (r.accessCount < 2) return true;
        return false;
    }).slice(0, 3);

    return (
        <motion.div 
            className="dashboard-page"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="hero-header" style={{ marginBottom: '2.5rem', animation: 'fadeInUp 0.5s ease-out' }}>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                    <h1 style={{ fontSize: '2.4rem', fontWeight: '800', margin: '0 0 0.5rem 0', color: 'var(--text-color)', letterSpacing: '-0.5px' }}>
                        {timeGreeting}, <span style={{ color: 'var(--text-color)', position: 'relative', display: 'inline-block' }}>{greeting}<div className="animated-underline-thin"></div></span> 👋
                    </h1>
                </div>
                <p style={{ fontSize: '1rem', color: 'var(--text-muted)', margin: 0, fontWeight: 500 }}>
                    {motivationCopy}
                </p>
                {(activeModesCount.learning > 0 || activeModesCount.revision > 0) && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: '1.5rem', display: 'inline-flex', flexDirection: 'column', gap: '0.75rem', background: 'var(--card-bg)', padding: '1rem 1.5rem', borderRadius: '12px', border: `1px solid rgba(139, 92, 246, 0.3)`, boxShadow: `0 8px 24px rgba(139, 92, 246, 0.1)` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                            <span style={{ fontSize: '1.2rem' }}>🎯</span>
                            <span style={{ fontWeight: '700', color: '#8b5cf6', fontSize: '0.9rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Active Collection Modes</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                            {activeModesCount.learning > 0 && <span style={{ fontSize: '0.9rem', color: '#3b82f6', fontWeight: '600' }}><span style={{ fontSize: '1.1rem', marginRight: '4px' }}>📚</span> {activeModesCount.learning} Collection{activeModesCount.learning > 1 ? 's' : ''} in Learning Mode</span>}
                            {activeModesCount.revision > 0 && <span style={{ fontSize: '0.9rem', color: '#ef4444', fontWeight: '600' }}><span style={{ fontSize: '1.1rem', marginRight: '4px' }}>🔥</span> {activeModesCount.revision} Collection{activeModesCount.revision > 1 ? 's' : ''} in Revision Mode</span>}
                            <button onClick={() => navigate('/active-modes')} className="btn-primary" style={{ marginLeft: '1rem', fontSize: '0.85rem', padding: '0.5rem 1.25rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' }}>View Resources</button>
                            <button onClick={clearAllModes} style={{ marginLeft: '1rem', fontSize: '0.75rem', padding: '0.4rem 1rem', borderRadius: '999px', border: 'none', background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' }}>Clear All</button>
                        </div>
                    </motion.div>
                )}
            </div>

            <SearchBar onSearch={handleSearch} />

            {isSearching ? (
                <div className="search-results glass-panel" style={{ marginTop: '2rem', padding: '2rem' }}>
                    <h3 className="section-title">Search Results</h3>
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
                        {searchResults.length === 0 && <p className="text-muted">No resources found matching your search.</p>}
                    </div>
                </div>
            ) : (
                <>
                    {!loading && stats.total === 0 && (
                        <EmptyState 
                            title="Welcome to your Dashboard!"
                            message="You haven't added any resources yet. Start tracking your learning journey by creating a collection or adding a resource."
                            actionText="Create your first collection"
                            onAction={() => navigate('/collections')}
                        />
                    )}

                    {stats.total > 0 && suggestedResources.length > 0 && (
                        <div className="suggested-section" style={{ marginBottom: '3rem' }}>
                            <h3 className="section-title" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ color: 'var(--primary-color)' }}>🎯</span> Suggested for Today
                            </h3>
                            <div className="resource-grid">
                                {suggestedResources.map(resource => (
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

                    {stats.total > 0 && (
                        <div className="stats-grid">
                        <StatCard title="Total Resources" value={stats.total} icon={Library} colorClass="primary" />
                        <StatCard title="Completed" value={stats.completed} icon={CheckCircle2} colorClass="success" />
                        <StatCard title="In Progress" value={stats.inProgress} icon={Clock} colorClass="warning" />
                        <StatCard title="Not Started" value={stats.notStarted} icon={CircleDashed} colorClass="danger" />
                        <StatCard title="Bookmarked" value={stats.bookmarked} icon={Bookmark} colorClass="purple" />
                        <StatCard title="Avg. Quality" value={stats.avgLearningValue + ' ★'} icon={Star} colorClass="success" />
                        <StatCard title="Top Type" value={stats.mostUsedType} icon={PieChartIcon} colorClass="primary" />
                    </div>
                    )}

                    <LearningHeatmap resources={allResources} />

                    {stats.total > 0 && (
                        <div className="charts-section">
                            <div className="chart-card glass-panel" style={{ animation: 'fadeInUp 0.6s ease-out backwards' }}>
                                <h3 className="chart-title">Learning Progress</h3>
                                <ResponsiveContainer width="100%" height="90%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%" cy="50%"
                                            innerRadius={75}
                                            outerRadius={110}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={6} />
                                            ))}
                                        </Pie>
                                        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central">
                                            <tspan x="50%" dy="-0.2em" fontSize="32" fontWeight="800" fill="var(--text-color)">{stats.completed}</tspan>
                                            <tspan x="50%" dy="1.5em" fontSize="13" fill="var(--text-muted)">Completed</tspan>
                                        </text>
                                        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--card-bg)' }} />
                                        <Legend verticalAlign="bottom" height={36} wrapperStyle={{ paddingTop: '20px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="chart-card glass-panel" style={{ animation: 'fadeInUp 0.7s ease-out backwards' }}>
                                <h3 className="chart-title">Resources By Type</h3>
                                <ResponsiveContainer width="100%" height="90%">
                                    <BarChart data={typeData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)' }} />
                                        <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)' }} />
                                        <Tooltip cursor={{ fill: 'rgba(79, 70, 229, 0.05)' }} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--card-bg)', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                                        <Bar dataKey="count" radius={[6, 6, 6, 6]} barSize={40}>
                                            {typeData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={TYPE_COLORS[index % TYPE_COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}
                </>
            )}
        </motion.div>
    );
};

export default Dashboard;
