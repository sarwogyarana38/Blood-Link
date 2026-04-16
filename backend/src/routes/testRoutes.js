const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const checkRole = require("../middleware/roleMiddleware");

router.get("/admin", verifyToken, checkRole("admin"), (req, res) => {
  res.json({ message: "Welcome Admin" });
});

router.get("/donor", verifyToken, checkRole("donor"), (req, res) => {
  res.json({ message: "Welcome Donor" });
});

router.get("/recipient", verifyToken, checkRole("recipient"), (req, res) => {
  res.json({ message: "Welcome Recipient" });
});

module.exports = router;