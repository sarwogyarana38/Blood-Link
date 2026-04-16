const express = require("express");
const router = express.Router();
const db = require("../config/db");

//donation activity
router.get("/me", (req, res) => {
  const userId = 17; // used my donor user id

  const sql = `
    SELECT * FROM donation_activity 
    WHERE user_id = ?
    ORDER BY activity_date DESC
  `;

  db.query(sql, [userId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }

    return res.json({
      data: result,
    });
  });
});

module.exports = router;