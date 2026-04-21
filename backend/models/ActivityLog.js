const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
        actionStr: {
            type: String,
            required: true, // e.g., 'STUDIED_RESOURCE', 'CREATED_RESOURCE'
        },
        resourceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Resource",
        },
        // We trim the timestamp to the strict localized date string for O(1) streak queries
        dateKey: { 
            type: String, 
            required: true 
        },
        durationSeconds: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true,
    }
);

// To ensure simple query speeds over thousands of records
activityLogSchema.index({ userId: 1, dateKey: 1 });

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);
module.exports = ActivityLog;
