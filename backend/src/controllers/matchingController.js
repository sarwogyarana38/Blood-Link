const db = require("../config/db");

const getCompatibleDonorGroups = (recipientBloodGroup) => {
  const compatibilityMap = {
    "O-": ["O-"],
    "O+": ["O+", "O-"],
    "A-": ["A-", "O-"],
    "A+": ["A+", "A-", "O+", "O-"],
    "B-": ["B-", "O-"],
    "B+": ["B+", "B-", "O+", "O-"],
    "AB-": ["AB-", "A-", "B-", "O-"],
    "AB+": ["AB+", "AB-", "A+", "A-", "B+", "B-", "O+", "O-"],
  };

  return compatibilityMap[recipientBloodGroup] || [];
};

const searchMatchingDonors = (req, res) => {
  try {
    const { blood_group } = req.query;

    if (!blood_group) {
      return res.status(400).json({
        message: "blood_group is required",
      });
    }

    const compatibleGroups = getCompatibleDonorGroups(blood_group);

    if (compatibleGroups.length === 0) {
      return res.status(400).json({
        message: "Invalid blood group",
      });
    }

    const placeholders = compatibleGroups.map(() => "?").join(",");

    const sql = `
      SELECT
        dp.id,
        dp.user_id,
        dp.blood_group,
        dp.gender,
        dp.city,
        dp.availability_status,
        dp.verified,
        COALESCE(dp.eligible_status, 1) AS eligible_status,
        u.full_name,
        u.email,
        u.phone
      FROM donor_profiles dp
      JOIN users u ON dp.user_id = u.id
      WHERE dp.blood_group IN (${placeholders})
        AND dp.availability_status = 'available'
        AND COALESCE(dp.eligible_status, 1) = 1
        AND u.role = 'donor'
      ORDER BY
        CASE WHEN dp.blood_group = ? THEN 0 ELSE 1 END,
        dp.verified DESC,
        dp.id DESC
    `;

    const values = [...compatibleGroups, blood_group];

    db.query(sql, values, (err, result) => {
      if (err) {
        return res.status(500).json({
          message: "Database error",
          error: err.message,
        });
      }

      return res.status(200).json({
        requestedBloodGroup: blood_group,
        compatibleDonorGroups: compatibleGroups,
        totalMatches: result.length,
        donors: result,
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
  searchMatchingDonors,
};