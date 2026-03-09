const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
    {
        collectionId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Collection",
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        type: {
            type: String,
        },
        link: {
            type: String,
        },
        tags: {
            type: [String],
        },
        status: {
            type: String,
            enum: ["Not Started", "In Progress", "Completed"],
            default: "Not Started",
        },
        rating: {
            type: Number,
            min: 0,
            max: 5,
        },
        bookmarked: {
            type: Boolean,
            default: false,
        },
        learningItems: [
            {
                type: {
                    type: String,
                    required: true,
                    enum: ["Question Link", "Text Note", "File Upload", "Image Upload", "File / Image Upload", "Article"],
                },
                title: String,
                content: String,       // for text notes and articles
                link: String,          // for external links
                fileUrl: String,       // path for uploaded files/images
                originalName: String,  // original filename for display
                createdAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
    },
    {
        timestamps: true,
    }
);

const Resource = mongoose.model("Resource", resourceSchema);

module.exports = Resource;