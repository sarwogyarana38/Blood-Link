const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const checkRole = require("../middleware/roleMiddleware");

const {
  addBloodUnit,
  getAllBloodStock,
  updateBloodStock,
  getExpiringBloodStock
} = require("../controllers/inventoryController");

router.post("/", verifyToken, checkRole("admin"), addBloodUnit);
router.get("/", verifyToken, checkRole("admin", "recipient"), getAllBloodStock);
router.put("/:id", verifyToken, checkRole("admin"), updateBloodStock);
router.get("/expiring/list", verifyToken, checkRole("admin"), getExpiringBloodStock);

module.exports = router;