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
    const { blood_group, city } = req.query;

    if (!blood_group) {
      return res.status(400).json({ message: "Blood group is required" });
    }

    const compatibleGroups = getCompatibleDonorGroups(blood_group);

    if (compatibleGroups.length === 0) {
      return res.status(400).json({ message: "Invalid blood group" });
    }

    let sql = `
      SELECT 
        dp.id,
        dp.user_id,
        u.full_name,
        u.email,
        u.phone,
        dp.blood_group,
        dp.gender,
        dp.date_of_birth,
        dp.age,
        dp.weight,
        dp.address,
        dp.city,
        dp.health_status,
        dp.last_donation_date,
        dp.availability_status,
        dp.verified,
        dp.eligible_status
      FROM donor_profiles dp
      JOIN users u ON dp.user_id = u.id
      WHERE dp.blood_group IN (?)
        AND dp.availability_status = 'available'
        AND dp.eligible_status = 1
        AND (dp.health_status = 'Healthy' OR dp.health_status = 'healthy' OR dp.health_status IS NULL)
        AND (dp.weight IS NULL OR dp.weight >= 50)
    `;

    const params = [compatibleGroups];

    if (city && city.trim() !== "") {
      sql += ` AND dp.city = ?`;
      params.push(city.trim());
    }

    sql += ` ORDER BY dp.verified DESC, dp.created_at DESC`;

    db.query(sql, params, (err, results) => {
      if (err) {
        console.error("MATCHING ERROR:", err);
        return res.status(500).json({
          message: "Error searching matching donors",
          error: err.message,
        });
      }

      return res.status(200).json({
        message: "Matching donors fetched successfully",
        count: results.length,
        data: results,
      });
    });
  } catch (error) {
    console.error("SERVER ERROR:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  searchMatchingDonors,
};