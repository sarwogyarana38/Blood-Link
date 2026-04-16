const express = require("express");
const router = express.Router();
const donorController = require("../controllers/donorController");
const verifyToken = require("../middleware/authMiddleware");

router.get("/me", verifyToken, donorController.getMyDonorProfile);
router.post("/", verifyToken, donorController.addDonorProfile);
router.put("/", verifyToken, donorController.updateMyDonorProfile);
router.get("/eligibility", verifyToken, donorController.getEligibilityStatus);
router.get("/dashboard", verifyToken, donorController.getDonorDashboard);

module.exports = router;