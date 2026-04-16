const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const checkRole = require("../middleware/roleMiddleware");
const { searchMatchingDonors } = require("../controllers/matchingController");

router.get("/search", verifyToken, checkRole("recipient", "admin"), searchMatchingDonors);

module.exports = router;