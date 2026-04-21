const ActivityLog = require("../models/ActivityLog");

// @desc    Record a time pulse to increment duration for the user's active day
// @route   POST /api/activity/pulse
// @access  Private
const logPulse = async (req, res) => {
    try {
        const { seconds = 10, resourceId } = req.body;
        const dateKey = new Date().toDateString();
        const userId = req.user._id;
        
        let activity = await ActivityLog.findOne({
            userId,
            dateKey,
            actionStr: "STUDY_SESSION"
        });

        if (!activity) {
            activity = new ActivityLog({
                userId,
                dateKey,
                actionStr: "STUDY_SESSION",
                durationSeconds: 0
            });
        }
        
        // Capping to prevent obvious runaway spam (e.g., maximum 30 seconds logged per rapid request)
        const safeSeconds = Math.min(parseInt(seconds, 10), 30);
        activity.durationSeconds += safeSeconds;
        
        if (resourceId) {
            activity.resourceId = resourceId;
        }

        await activity.save();

        res.json({ success: true, durationSeconds: activity.durationSeconds });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Fetch daily activity duration records for the heatmap
// @route   GET /api/activity/history
// @access  Private
const getActivityHistory = async (req, res) => {
    try {
        const userId = req.user._id;
        
        const activities = await ActivityLog.find({ 
            userId,
            actionStr: "STUDY_SESSION"
        }).select("dateKey durationSeconds");

        res.json(activities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    logPulse,
    getActivityHistory
};
