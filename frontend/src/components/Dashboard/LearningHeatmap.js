import React, { useMemo, useState, useEffect } from 'react';
import API from '../../services/api';
import './LearningHeatmap.css';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const RANGE_MAP = {
    '1year': { days: 364, label: 'year' },
    '6months': { days: 182, label: '6 months' },
    '90days': { days: 89, label: '90 days' }
};

const LearningHeatmap = () => {
    const [timeRange, setTimeRange] = useState('1year');
    const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, text1: '', text2: '' });
    const [activityLogs, setActivityLogs] = useState([]);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const { data } = await API.get('/activity/history');
                setActivityLogs(data);
            } catch (err) {
                console.error('Failed to fetch activity history:', err);
            }
        };
        fetchHistory();
    }, []);

    const activityMap = useMemo(() => {
        const map = {};
        activityLogs.forEach(log => {
            map[log.dateKey] = (map[log.dateKey] || 0) + log.durationSeconds;
        });
        return map;
    }, [activityLogs]);

    const { gridData, goalMetDays, activeDays, maxStreak, consistencyScore } = useMemo(() => {
        const today = new Date();
        today.setHours(0,0,0,0);
        
        const config = RANGE_MAP[timeRange];
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - config.days);
        
        // Pad to start of week (Sunday)
        const startWeekday = startDate.getDay();
        const paddedStartDate = new Date(startDate);
        paddedStartDate.setDate(startDate.getDate() - startWeekday);

        const weeks = [];
        let currentDate = new Date(paddedStartDate);
        let currentWeek = [];
        const monthOffsets = []; 
        let lastMonth = -1;
        
        // Metrics track
        let goalMetDays = 0;
        let activeD = 0;
        let currentStreak = 0;
        let mStreak = 0;

        let metricDate = new Date(startDate);
        while (metricDate <= today) {
            const dateStr = metricDate.toDateString();
            const durationSec = activityMap[dateStr] || 0;
            
            if (durationSec > 0) {
                activeD += 1;
            }

            // User requirement: minimum 30 min (1800 sec) in a day to count as "Learning"
            if (durationSec >= 1800) {
                goalMetDays += 1;
                currentStreak += 1;
                if (currentStreak > mStreak) mStreak = currentStreak;
            } else {
                currentStreak = 0;
            }
            metricDate.setDate(metricDate.getDate() + 1);
        }

        // Generate grid rendering layout (includes week padding)
        while (currentDate <= today || currentWeek.length > 0) {
            // Label rendering at the start of a month
            if (currentDate.getMonth() !== lastMonth && currentDate.getDate() <= 7) {
                monthOffsets.push({ index: weeks.length, label: MONTH_LABELS[currentDate.getMonth()] });
                lastMonth = currentDate.getMonth();
            }
            
            if (currentDate < startDate || currentDate > today) {
                currentWeek.push(null);
            } else {
                currentWeek.push(new Date(currentDate));
            }
            
            currentDate.setDate(currentDate.getDate() + 1);
            if (currentWeek.length === 7) {
                weeks.push(currentWeek);
                currentWeek = [];
            }
        }

        const exactDays = config.days + 1;
        let cScore = Math.min(Math.round((goalMetDays / exactDays) * 100), 100);

        return { 
            gridData: { weeks, monthOffsets },
            goalMetDays,
            activeDays: activeD,
            maxStreak: mStreak,
            consistencyScore: cScore
        };
    }, [timeRange, activityMap]);

    const getIntensityClass = (durationSec) => {
        if (durationSec === 0) return 'level-0';
        if (durationSec < 900) return 'level-1';  // < 15 mins (Faint)
        if (durationSec < 1800) return 'level-2'; // 15-30 mins
        if (durationSec < 3600) return 'level-3'; // 30-60 mins (Goal Unlocked!)
        return 'level-4'; // 60+ mins
    };

    const handleMouseEnter = (e, dateStr, durationSec, dateObj) => {
        const rect = e.target.getBoundingClientRect();
        
        let formattedDate = `${MONTH_LABELS[dateObj.getMonth()]} ${dateObj.getDate()}, ${dateObj.getFullYear()}`;
        
        let text2 = '0 mins';
        if (durationSec > 0) {
            const mins = Math.floor(durationSec / 60);
            text2 = `${mins} min${mins !== 1 ? 's' : ''}`;
        }

        setTooltip({
            show: true,
            x: rect.left + (rect.width / 2),
            y: rect.top - 8,
            text1: formattedDate,
            text2: text2
        });
    };

    const handleMouseLeave = () => {
        setTooltip(prev => ({ ...prev, show: false }));
    };

    return (
        <div className="learning-heatmap-container data-panel">
            <div className="heatmap-header-analytics">
                <div className="heatmap-header-left">
                    <h3 className="analytics-primary-stat">{goalMetDays} times you met the 30-min goal this {RANGE_MAP[timeRange].label}</h3>
                </div>
                
                <div className="heatmap-header-right">
                    <div className="analytics-metric">
                        <span className="metric-label">30+ Min Goal Days:</span>
                        <span className="metric-value">{goalMetDays}</span>
                    </div>
                    <div className="analytics-metric">
                        <span className="metric-label">Longest Learning Streak:</span>
                        <span className="metric-value">{maxStreak}</span>
                    </div>
                    <div className="analytics-metric consistency-pill">
                        <span className="metric-label">Consistency Score:</span>
                        <span className="metric-value">{consistencyScore}%</span>
                    </div>
                    <select 
                        className="time-filter-dropdown" 
                        value={timeRange} 
                        onChange={(e) => setTimeRange(e.target.value)}
                    >
                        <option value="90days">Last 90 Days</option>
                        <option value="6months">Last 6 Months</option>
                        <option value="1year">Last 1 Year</option>
                    </select>
                </div>
            </div>

            <div className="heatmap-wrapper">
                <div className="heatmap-y-axis">
                    <span style={{ gridRow: 2 }}>Mon</span>
                    <span style={{ gridRow: 4 }}>Wed</span>
                    <span style={{ gridRow: 6 }}>Fri</span>
                </div>
                
                <div className="heatmap-main">
                    <div className="heatmap-grid" style={{ gridTemplateColumns: `repeat(${gridData.weeks.length}, 1fr)` }}>
                        {gridData.weeks.map((week, wIdx) => (
                            <div key={wIdx} className="heatmap-col">
                                {week.map((date, dIdx) => {
                                    if (!date) return <div key={`empty-${wIdx}-${dIdx}`} className="heatmap-cell empty"></div>;
                                    const dateStr = date.toDateString();
                                    const durationSec = activityMap[dateStr] || 0;
                                    return (
                                        <div 
                                            key={dIdx} 
                                            className={`heatmap-cell ${getIntensityClass(durationSec)}`}
                                            onMouseEnter={(e) => handleMouseEnter(e, dateStr, durationSec, date)}
                                            onMouseLeave={handleMouseLeave}
                                        ></div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>

                    {/* X-Axis labels below grid */}
                    <div className="heatmap-x-axis">
                        {gridData.monthOffsets.map((mo, i) => (
                            <span key={i} style={{ position: 'absolute', left: `calc(${mo.index} * 18px)`}}>{mo.label}</span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="heatmap-footer">
                <div className="heatmap-legend">
                    <span>Less</span>
                    <div className="heatmap-cell level-0"></div>
                    <div className="heatmap-cell level-1"></div>
                    <div className="heatmap-cell level-2"></div>
                    <div className="heatmap-cell level-3"></div>
                    <div className="heatmap-cell level-4"></div>
                    <span>More</span>
                </div>
            </div>

            {/* Custom Tooltip */}
            {tooltip.show && (
                <div 
                    className="heatmap-custom-tooltip"
                    style={{
                        position: 'fixed',
                        top: `${tooltip.y}px`,
                        left: `${tooltip.x}px`,
                        transform: 'translate(-50%, -100%)',
                        zIndex: 9999
                    }}
                >
                    <div className="tooltip-date">{tooltip.text1}</div>
                    <div className="tooltip-count">{tooltip.text2}</div>
                </div>
            )}
        </div>
    );
};

export default LearningHeatmap;
