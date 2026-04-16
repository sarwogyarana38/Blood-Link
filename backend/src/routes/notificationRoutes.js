const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");
const {
  getMyNotifications,
  markNotificationAsRead,
  sendTestEmail,
} = require("../controllers/notificationController");

router.get("/", verifyToken, getMyNotifications);
router.put("/:id/read", verifyToken, markNotificationAsRead);
router.post("/test-email", verifyToken, sendTestEmail);

module.exports = router;