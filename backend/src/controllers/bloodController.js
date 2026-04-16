const db = require("../config/db");

const searchBlood = (req, res) => {
  try {
    const { bloodGroup } = req.query;

    if (!bloodGroup) {
      return res.status(400).json({
        message: "bloodGroup is required",
      });
    }

    const sql = `
      SELECT blood_group, COALESCE(SUM(units_available), 0) AS units
      FROM blood_inventory
      WHERE blood_group = ? AND status = 'available'
      GROUP BY blood_group
    `;

    db.query(sql, [bloodGroup], (err, result) => {
      if (err) {
        return res.status(500).json({
          message: "Database error",
          error: err.message,
        });
      }

      return res.status(200).json({
        data: result,
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
  searchBlood,
};