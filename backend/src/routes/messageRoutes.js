const express = require("express");
const router = express.Router();

const {
  sendMessage,
  getConversation,
  getMyChats,
  getAllUsers
} = require("../controllers/messageController");

// ✅ IMPORT AUTH MIDDLEWARE (VERY IMPORTANT)
const authMiddleware = require("../middleware/authMiddleware");

// ✅ APPLY AUTH TO ALL ROUTES
router.use(authMiddleware);

// ✅ GET USERS (donor ↔ recipient)
router.get("/users", getAllUsers);

// ✅ SEND MESSAGE
router.post("/", sendMessage);

// ✅ GET CONVERSATION
router.get("/conversation/:userId", getConversation);

// ✅ GET MY CHATS
router.get("/my-chats", getMyChats);

module.exports = router;