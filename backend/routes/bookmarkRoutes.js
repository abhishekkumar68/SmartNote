const express = require("express");
const router = express.Router();
const {
    getBookmarks,
    addBookmark,
    removeBookmark,
} = require("../controllers/bookmarkController");
const { protect } = require("../middleware/authMiddleware");

router.route("/").get(protect, getBookmarks);
router.route("/:id").post(protect, addBookmark).delete(protect, removeBookmark);

module.exports = router;
