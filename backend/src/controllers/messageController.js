const db = require("../config/db");

// ✅ SEND MESSAGE
const sendMessage = (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiver_id, message_text } = req.body;

    if (!receiver_id || !message_text) {
      return res.status(400).json({
        message: "receiver_id and message_text are required",
      });
    }

    const sql = `
      INSERT INTO messages (sender_id, receiver_id, message_text)
      VALUES (?, ?, ?)
    `;

    db.query(sql, [senderId, receiver_id, message_text], (err, result) => {
      if (err) {
        return res.status(500).json({
          message: "Insert error",
          error: err.message,
        });
      }

      return res.status(201).json({
        message: "Message sent successfully",
        messageId: result.insertId,
      });
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ✅ GET CONVERSATION
const getConversation = (req, res) => {
  try {
    const userId = req.user.id;
    const otherUserId = req.params.userId;

    const sql = `
      SELECT 
        m.*,
        sender.full_name AS sender_name,
        receiver.full_name AS receiver_name
      FROM messages m
      JOIN users sender ON m.sender_id = sender.id
      JOIN users receiver ON m.receiver_id = receiver.id
      WHERE 
        (m.sender_id = ? AND m.receiver_id = ?)
        OR
        (m.sender_id = ? AND m.receiver_id = ?)
      ORDER BY m.created_at ASC
    `;

    db.query(
      sql,
      [userId, otherUserId, otherUserId, userId],
      (err, result) => {
        if (err) {
          return res.status(500).json({
            message: "Database error",
            error: err.message,
          });
        }

        return res.status(200).json({
          conversation: result,
        });
      }
    );
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ✅ GET EXISTING CHATS - LATEST MESSAGE FIRST
const getMyChats = (req, res) => {
  try {
    const userId = req.user.id;

    const sql = `
      SELECT 
        u.id,
        u.full_name,
        u.role,
        MAX(m.created_at) AS last_message_time
      FROM users u
      JOIN messages m
        ON (u.id = m.sender_id AND m.receiver_id = ?)
        OR (u.id = m.receiver_id AND m.sender_id = ?)
      WHERE u.id != ?
      GROUP BY u.id, u.full_name, u.role
      ORDER BY last_message_time DESC
    `;

    db.query(sql, [userId, userId, userId], (err, result) => {
      if (err) {
        return res.status(500).json({
          message: "Database error",
          error: err.message,
        });
      }

      return res.status(200).json({
        chats: result,
      });
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ✅ GET USERS BASED ON ROLE
// donor sees recipients
// recipient sees donors
// admin sees both donor and recipient
const getAllUsers = (req, res) => {
  try {
    const currentUserId = req.user.id;
    const currentUserRole = req.user.role;

    let sql = "";
    let params = [];

    if (currentUserRole === "donor") {
      sql = `
        SELECT id, full_name, role
        FROM users
        WHERE role = 'recipient' AND id != ?
        ORDER BY full_name ASC
      `;
      params = [currentUserId];
    } else if (currentUserRole === "recipient") {
      sql = `
        SELECT id, full_name, role
        FROM users
        WHERE role = 'donor' AND id != ?
        ORDER BY full_name ASC
      `;
      params = [currentUserId];
    } else {
      sql = `
        SELECT id, full_name, role
        FROM users
        WHERE role IN ('donor', 'recipient') AND id != ?
        ORDER BY full_name ASC
      `;
      params = [currentUserId];
    }

    db.query(sql, params, (err, result) => {
      if (err) {
        return res.status(500).json({
          message: "Database error",
          error: err.message,
        });
      }

      return res.status(200).json({
        users: result,
      });
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  sendMessage,
  getConversation,
  getMyChats,
  getAllUsers,
};