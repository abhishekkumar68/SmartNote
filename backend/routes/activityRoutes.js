const express = require("express");
const router = express.Router();
const { logPulse, getActivityHistory } = require("../controllers/activityController");
const { protect } = require("../middleware/authMiddleware");

router.route("/pulse").post(protect, logPulse);
router.route("/history").get(protect, getActivityHistory);

module.exports = router;
