const express = require("express");
const router = express.Router();
const {
    getResources,
    createResource,
    updateResource,
    deleteResource,
    searchResources,
    getResourcesByCollection,
    getResourceById,
    addLearningItem,
    deleteLearningItem,
    updateLearningItem
} = require("../controllers/resourceController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// Note: search route must be defined before /:id to prevent "search" being treated as an id
router.get("/search", protect, searchResources);
router.route("/").get(protect, getResources).post(protect, upload.single('file'), createResource);
router.get("/single/:id", protect, getResourceById);
router.get("/:collectionId", protect, getResourcesByCollection);

router.route("/:id").put(protect, upload.single('file'), updateResource).delete(protect, deleteResource);
router.route("/:id/items").post(protect, upload.single('file'), addLearningItem);
router.route("/:id/items/:itemId").delete(protect, deleteLearningItem).put(protect, upload.single('file'), updateLearningItem);

module.exports = router;
