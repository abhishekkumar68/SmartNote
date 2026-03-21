import React, { useMemo, useState } from 'react';
import './LearningHeatmap.css';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const RANGE_MAP = {
    '1year': { days: 364, label: 'year' },
    '6months': { days: 182, label: '6 months' },
    '90days': { days: 89, label: '90 days' }
};

const LearningHeatmap = ({ resources = [] }) => {
    const [timeRange, setTimeRange] = useState('1year');
    const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, text1: '', text2: '' });

    const activityMap = useMemo(() => {
        const map = {};
        resources.forEach(r => {
            if (r.createdAt) {
                const dateStr = new Date(r.createdAt).toDateString();
                map[dateStr] = (map[dateStr] || 0) + 1;
            }
            if (r.updatedAt && r.updatedAt !== r.createdAt) {
                const dateStr = new Date(r.updatedAt).toDateString();
                map[dateStr] = (map[dateStr] || 0) + 1;
            }
        });
        return map;
    }, [resources]);

    const { gridData, totalActions, activeDays, maxStreak, consistencyScore } = useMemo(() => {
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
        let actions = 0;
        let activeD = 0;
        let currentStreak = 0;
        let mStreak = 0;

        // Iterate sequentially through the exact requested period to calculate precise metrics
        // We only calculate metrics for days within the requested strict range
        let metricDate = new Date(startDate);
        while (metricDate <= today) {
            const dateStr = metricDate.toDateString();
            const count = activityMap[dateStr] || 0;
            if (count > 0) {
                actions += count;
                activeD += 1;
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
        let cScore = Math.min(Math.round((activeD / exactDays) * 100), 100);

        return { 
            gridData: { weeks, monthOffsets },
            totalActions: actions,
            activeDays: activeD,
            maxStreak: mStreak,
            consistencyScore: cScore
        };
    }, [timeRange, activityMap]);

    const getIntensityClass = (count) => {
        if (count === 0) return 'level-0';
        if (count === 1) return 'level-1';
        if (count === 2) return 'level-2';
        if (count >= 3 && count < 5) return 'level-3';
        if (count >= 5) return 'level-4';
        return 'level-0';
    };

    const handleMouseEnter = (e, dateStr, count, dateObj) => {
        const rect = e.target.getBoundingClientRect();
        
        let formattedDate = `${MONTH_LABELS[dateObj.getMonth()]} ${dateObj.getDate()}, ${dateObj.getFullYear()}`;
        
        setTooltip({
            show: true,
            x: rect.left + (rect.width / 2),
            y: rect.top - 8,
            text1: formattedDate,
            text2: `${count} learning action${count !== 1 ? 's' : ''}`
        });
    };

    const handleMouseLeave = () => {
        setTooltip(prev => ({ ...prev, show: false }));
    };

    return (
        <div className="learning-heatmap-container data-panel">
            <div className="heatmap-header-analytics">
                <div className="heatmap-header-left">
                    <h3 className="analytics-primary-stat">{totalActions} learning actions in the past {RANGE_MAP[timeRange].label}</h3>
                </div>
                
                <div className="heatmap-header-right">
                    <div className="analytics-metric">
                        <span className="metric-label">Active Learning Days:</span>
                        <span className="metric-value">{activeDays}</span>
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
                                    const count = activityMap[dateStr] || 0;
                                    return (
                                        <div 
                                            key={dIdx} 
                                            className={`heatmap-cell ${getIntensityClass(count)}`}
                                            onMouseEnter={(e) => handleMouseEnter(e, dateStr, count, date)}
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
