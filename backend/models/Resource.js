const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
{
    collectionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Collection",
        required: true
    },

    title: {
        type: String,
        required: true
    },

    description: {
        type: String
    },

    type: {
        type: String
    },

    link: {
        type: String
    },

    tags: [
        {
            type: String
        }
    ],

    status: {
        type: String,
        enum: ["Not Started", "In Progress", "Completed"],
        default: "Not Started"
    },

    rating: {
        type: Number,
        default: 0
    },

    bookmarked: {
        type: Boolean,
        default: false
    }
},
{
    timestamps: true
}
);

module.exports = mongoose.model("Resource", resourceSchema);