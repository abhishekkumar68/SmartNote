const Resource = require("../models/Resource");
const Collection = require("../models/Collection");

// Helper to check user ownership
const verifyCollectionOwner = async (collectionId, userId) => {
    const collection = await Collection.findById(collectionId);
    return collection && collection.userId.toString() === userId.toString();
};

const searchResources = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.json([]);
        }
        const userCollections = await Collection.find({ userId: req.user._id }).select('_id');
        const collectionIds = userCollections.map(c => c._id);

        const resources = await Resource.find({
            collectionId: { $in: collectionIds },
            $or: [
                { title: { $regex: q, $options: "i" } },
                { description: { $regex: q, $options: "i" } },
                { tags: { $regex: q, $options: "i" } },
                { type: { $regex: q, $options: "i" } },
            ]
        }).populate('collectionId', 'title');
        res.json(resources);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getResourcesByCollection = async (req, res) => {
    try {
        const { collectionId } = req.params;
        const isOwner = await verifyCollectionOwner(collectionId, req.user._id);
        if (!isOwner) return res.status(401).json({ message: "Not authorized or collection not found" });

        const resources = await Resource.find({ collectionId })
            .populate('collectionId', 'title')
            .sort({ createdAt: -1 });
        res.json(resources);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getResourceById = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id)
            .populate('collectionId', 'title');

        if (!resource) return res.status(404).json({ message: "Resource not found" });

        const isOwner = await verifyCollectionOwner(resource.collectionId._id, req.user._id);
        if (!isOwner) return res.status(401).json({ message: "Not authorized" });

        res.json(resource);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getResources = async (req, res) => {
    try {
        const { collectionId } = req.query;
        const userCollections = await Collection.find({ userId: req.user._id }).select('_id');
        const collectionIds = userCollections.map(c => c._id);

        let filter = { collectionId: { $in: collectionIds } };
        if (collectionId) {
            filter.collectionId = collectionId;
        }
        const resources = await Resource.find(filter)
            .populate('collectionId', 'title')
            .sort({ createdAt: -1 });
        res.json(resources);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createResource = async (req, res) => {
    try {
        const { collectionId, title, description, type, link, tags, status, rating, bookmarked, notes } = req.body;
        const isOwner = await verifyCollectionOwner(collectionId, req.user._id);
        if (!isOwner) return res.status(401).json({ message: "Not authorized or collection not found" });

        let fileUrl = '';
        if (req.file) {
            fileUrl = `/uploads/${req.file.filename}`;
        }

        let parsedTags = tags;
        if (typeof tags === 'string') {
            try {
                parsedTags = JSON.parse(tags);
            } catch (e) {
                parsedTags = tags.split(',').map(t => t.trim());
            }
        }

        const resource = await Resource.create({
            collectionId, title, description, type, link, fileUrl, tags: parsedTags, status, rating, bookmarked, notes
        });
        const populated = await Resource.findById(resource._id).populate('collectionId', 'title');
        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateResource = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);
        if (!resource) return res.status(404).json({ message: "Resource not found" });

        const isOwner = await verifyCollectionOwner(resource.collectionId, req.user._id);
        if (!isOwner) return res.status(401).json({ message: "Not authorized" });

        if (req.body.collectionId && req.body.collectionId !== resource.collectionId.toString()) {
            const isNewOwner = await verifyCollectionOwner(req.body.collectionId, req.user._id);
            if (!isNewOwner) return res.status(401).json({ message: "Not authorized for target collection" });
        }

        let payload = { ...req.body };
        if (req.file) {
            payload.fileUrl = `/uploads/${req.file.filename}`;
        }

        if (typeof payload.tags === 'string') {
            try {
                payload.tags = JSON.parse(payload.tags);
            } catch (e) {
                payload.tags = payload.tags.split(',').map(t => t.trim());
            }
        }

        const updatedResource = await Resource.findByIdAndUpdate(req.params.id, payload, { new: true }).populate('collectionId', 'title');
        res.json(updatedResource);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteResource = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);
        if (!resource) return res.status(404).json({ message: "Resource not found" });

        const isOwner = await verifyCollectionOwner(resource.collectionId, req.user._id);
        if (!isOwner) return res.status(401).json({ message: "Not authorized" });

        await resource.deleteOne();
        res.json({ message: "Resource removed" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addLearningItem = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);
        if (!resource) return res.status(404).json({ message: "Resource not found" });

        const isOwner = await verifyCollectionOwner(resource.collectionId, req.user._id);
        if (!isOwner) return res.status(401).json({ message: "Not authorized" });

        const { type, title, content, link } = req.body;

        let fileUrl = '';
        let originalName = '';
        if (req.file) {
            fileUrl = `/uploads/${req.file.filename}`;
            originalName = req.file.originalname;
        }

        const newItem = {
            type,
            title,
            content,
            link,
            fileUrl,
            originalName
        };

        resource.learningItems.push(newItem);
        await resource.save();

        res.status(201).json(resource);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteLearningItem = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);
        if (!resource) return res.status(404).json({ message: "Resource not found" });

        const isOwner = await verifyCollectionOwner(resource.collectionId, req.user._id);
        if (!isOwner) return res.status(401).json({ message: "Not authorized" });

        resource.learningItems = resource.learningItems.filter(item => item._id.toString() !== req.params.itemId);
        await resource.save();

        res.json(resource);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateLearningItem = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);
        if (!resource) return res.status(404).json({ message: "Resource not found" });

        const isOwner = await verifyCollectionOwner(resource.collectionId, req.user._id);
        if (!isOwner) return res.status(401).json({ message: "Not authorized" });

        const itemToUpdate = resource.learningItems.id(req.params.itemId);
        if (!itemToUpdate) return res.status(404).json({ message: "Learning item not found" });

        const { title, content, link } = req.body;

        if (title !== undefined) itemToUpdate.title = title;
        if (content !== undefined) itemToUpdate.content = content;
        if (link !== undefined) itemToUpdate.link = link;

        if (req.file) {
            itemToUpdate.fileUrl = `/uploads/${req.file.filename}`;
            itemToUpdate.originalName = req.file.originalname;
        }

        await resource.save();
        res.json(resource);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    searchResources,
    getResources,
    getResourcesByCollection,
    getResourceById,
    createResource,
    updateResource,
    deleteResource,
    addLearningItem,
    deleteLearningItem,
    updateLearningItem
};
