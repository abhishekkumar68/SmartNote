const Collection = require("../models/Collection");
const Resource = require("../models/Resource");

// @desc    Get user collections
// @route   GET /api/collections
// @access  Private
const getCollections = async (req, res) => {
    try {
        const collections = await Collection.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(collections);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single collection by ID
// @route   GET /api/collections/:id
// @access  Private
const getCollection = async (req, res) => {
    try {
        const collection = await Collection.findById(req.params.id);
        if (!collection) {
            return res.status(404).json({ message: "Collection not found" });
        }
        if (collection.userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Not authorized" });
        }
        res.json(collection);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a collection
// @route   POST /api/collections
// @access  Private
const createCollection = async (req, res) => {
    try {
        const { title, description } = req.body;
        const collection = await Collection.create({
            userId: req.user._id,
            title,
            description,
        });
        res.status(201).json(collection);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a collection
// @route   PUT /api/collections/:id
// @access  Private
const updateCollection = async (req, res) => {
    try {
        let collection = await Collection.findById(req.params.id);
        if (!collection) {
            return res.status(404).json({ message: "Collection not found" });
        }
        if (collection.userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Not authorized" });
        }
        collection = await Collection.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(collection);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a collection
// @route   DELETE /api/collections/:id
// @access  Private
const deleteCollection = async (req, res) => {
    try {
        const collection = await Collection.findById(req.params.id);
        if (!collection) {
            return res.status(404).json({ message: "Collection not found" });
        }
        if (collection.userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Not authorized" });
        }
        await Resource.deleteMany({ collectionId: collection._id });
        await collection.deleteOne();
        res.json({ message: "Collection removed" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getCollections, getCollection, createCollection, updateCollection, deleteCollection };
