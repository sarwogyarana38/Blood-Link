const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");
const {
  createRequest,
  getAllRequests,
  getMyRequests,
  updateRequestStatus,
} = require("../controllers/requestController");

router.post("/", verifyToken, createRequest);
router.get("/", verifyToken, getAllRequests);
router.get("/my", verifyToken, getMyRequests);
router.put("/:id", verifyToken, updateRequestStatus);

module.exports = router;