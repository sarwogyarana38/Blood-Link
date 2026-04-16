const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const checkRole = require("../middleware/roleMiddleware");

const {
  getAllUsers,
  getAllRequests,
  verifyDonor
} = require("../controllers/adminController");

// ADMIN ROUTES
router.get("/users", verifyToken, checkRole("admin"), getAllUsers);
router.get("/requests", verifyToken, checkRole("admin"), getAllRequests);
router.put("/verify-donor/:id", verifyToken, checkRole("admin"), verifyDonor);

module.exports = router;