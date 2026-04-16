const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const checkRole = require("../middleware/roleMiddleware");
const {
  addRecipientProfile,
  createBloodRequest,
  getMyRequests
} = require("../controllers/recipientController");

router.post("/profile", verifyToken, checkRole("recipient"), addRecipientProfile);
router.post("/request", verifyToken, checkRole("recipient"), createBloodRequest);
router.get("/requests", verifyToken, checkRole("recipient"), getMyRequests);

module.exports = router;