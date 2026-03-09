const Resource = require("../models/Resource");
const Collection = require("../models/Collection");

const getBookmarks = async (req, res) => {
    try {
        const userCollections = await Collection.find({ userId: req.user._id }).select('_id');
        const collectionIds = userCollections.map(c => c._id);

        const resources = await Resource.find({
            collectionId: { $in: collectionIds },
            bookmarked: true
        })
            .populate('collectionId', 'title')
            .sort({ createdAt: -1 });

        res.json(resources);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addBookmark = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);
        if (!resource) return res.status(404).json({ message: "Resource not found" });

        const collection = await Collection.findById(resource.collectionId);
        if (!collection || collection.userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Not authorized" });
        }

        resource.bookmarked = true;
        const updatedResource = await resource.save();

        await updatedResource.populate('collectionId', 'title');
        res.json(updatedResource);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const removeBookmark = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);
        if (!resource) return res.status(404).json({ message: "Resource not found" });

        const collection = await Collection.findById(resource.collectionId);
        if (!collection || collection.userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Not authorized" });
        }

        resource.bookmarked = false;
        const updatedResource = await resource.save();

        await updatedResource.populate('collectionId', 'title');
        res.json(updatedResource);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getBookmarks, addBookmark, removeBookmark };
