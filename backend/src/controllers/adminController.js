const db = require("../config/db");

// GET ALL USERS
const getAllUsers = (req, res) => {
  try {
    const sql = "SELECT id, full_name, email, phone, role, created_at FROM users";

    db.query(sql, (err, result) => {
      if (err) {
        return res.status(500).json({
          message: "Database error",
          error: err.message
        });
      }

      return res.status(200).json({
        users: result
      });
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

// GET ALL BLOOD REQUESTS
const getAllRequests = (req, res) => {
  try {
    const sql = `
      SELECT br.*, u.full_name, u.email
      FROM blood_requests br
      JOIN users u ON br.recipient_id = u.id
      ORDER BY br.created_at DESC
    `;

    db.query(sql, (err, result) => {
      if (err) {
        return res.status(500).json({
          message: "Database error",
          error: err.message
        });
      }

      return res.status(200).json({
        requests: result
      });
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

// VERIFY DONOR
const verifyDonor = (req, res) => {
  try {
    const donorId = req.params.id;

    const sql = `
      UPDATE donor_profiles
      SET verified = 1
      WHERE user_id = ?
    `;

    db.query(sql, [donorId], (err, result) => {
      if (err) {
        return res.status(500).json({
          message: "Database error",
          error: err.message
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Donor not found"
        });
      }

      return res.status(200).json({
        message: "Donor verified successfully"
      });
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

module.exports = {
  getAllUsers,
  getAllRequests,
  verifyDonor
};