const db = require("../config/db");
const { sendEmail } = require("../services/mailService");

const createNotification = (userId, title, message, type = "info") => {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO notifications (user_id, title, message, type, is_read)
      VALUES (?, ?, ?, ?, 0)
    `;

    db.query(sql, [userId, title, message, type], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

const getMyNotifications = (req, res) => {
  try {
    const userId = req.user.id;

    const sql = `
      SELECT id, title, message, type, is_read, created_at
      FROM notifications
      WHERE user_id = ?
      ORDER BY id DESC
    `;

    db.query(sql, [userId], (err, result) => {
      if (err) {
        return res.status(500).json({
          message: "Failed to fetch notifications",
          error: err.message,
        });
      }

      return res.status(200).json({
        notifications: result,
      });
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const markNotificationAsRead = (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const sql = `
      UPDATE notifications
      SET is_read = 1
      WHERE id = ? AND user_id = ?
    `;

    db.query(sql, [id, userId], (err, result) => {
      if (err) {
        return res.status(500).json({
          message: "Failed to update notification",
          error: err.message,
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Notification not found",
        });
      }

      return res.status(200).json({
        message: "Notification marked as read",
      });
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const sendTestEmail = async (req, res) => {
  try {
    const { to } = req.body || {};

    if (!to) {
      return res.status(400).json({
        message: "Recipient email is required",
      });
    }

    await sendEmail({
      to,
      subject: "Blood Link Test Email",
      text: "This is a test email from Blood Link.",
      html: `
        <h2>Blood Link</h2>
        <p>This is a test email from your Blood Link system.</p>
      `,
    });

    return res.status(200).json({
      message: "Test email sent successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Email sending failed",
      error: error.message,
    });
  }
};

module.exports = {
  createNotification,
  getMyNotifications,
  markNotificationAsRead,
  sendTestEmail,
};