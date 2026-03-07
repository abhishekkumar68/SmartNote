const mongoose = require("mongoose");

const collectionSchema = new mongoose.Schema(
{
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    title: {
        type: String,
        required: true
    },

    description: {
        type: String
    }
},
{
    timestamps: true
}
);

module.exports = mongoose.model("Collection", collectionSchema);