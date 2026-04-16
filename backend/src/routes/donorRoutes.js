const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const checkRole = require("../middleware/roleMiddleware");
const {
  addDonorProfile,
  getMyDonorProfile,
  updateMyDonorProfile,
  getEligibilityStatus,
  getDonorDashboard
} = require("../controllers/donorController");

router.post("/profile", verifyToken, checkRole("donor"), addDonorProfile);
router.get("/profile", verifyToken, checkRole("donor"), getMyDonorProfile);
router.put("/profile", verifyToken, checkRole("donor"), updateMyDonorProfile);
router.get("/eligibility", verifyToken, checkRole("donor"), getEligibilityStatus);
router.get("/dashboard", verifyToken, checkRole("donor"), getDonorDashboard);

module.exports = router;