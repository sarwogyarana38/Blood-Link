const db = require("../config/db");

const addDonorProfile = (req, res) => {
  try {
    console.log("REQ USER:", req.user);
    console.log("REQ BODY:", req.body);

    const userId = req.user.id;
    const body = req.body || {};

    const {
      blood_group,
      gender,
      date_of_birth,
      weight,
      address,
      city,
      health_status,
      last_donation_date,
      availability_status
    } = body;

    if (!blood_group) {
      return res.status(400).json({ message: "Blood group is required" });
    }

    const checkSql = "SELECT * FROM donor_profiles WHERE user_id = ?";

    db.query(checkSql, [userId], (err, result) => {
      if (err) {
        console.error("CHECK ERROR:", err);
        return res.status(500).json({
          message: "Database error while checking donor profile",
          error: err.message
        });
      }

      if (result.length > 0) {
        return res.status(400).json({
          message: "Donor profile already exists"
        });
      }

      const insertSql = `
        INSERT INTO donor_profiles
        (user_id, blood_group, gender, date_of_birth, weight, address, city, health_status, last_donation_date, availability_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      db.query(
        insertSql,
        [
          userId,
          blood_group,
          gender || null,
          date_of_birth || null,
          weight || null,
          address || null,
          city || null,
          health_status || null,
          last_donation_date || null,
          availability_status || "available"
        ],
        (err, result) => {
          if (err) {
            console.error("INSERT ERROR:", err);
            return res.status(500).json({
              message: "Insert error",
              error: err.message
            });
          }

          return res.status(201).json({
            message: "Donor profile created successfully",
            profileId: result.insertId
          });
        }
      );
    });
  } catch (error) {
    console.error("SERVER ERROR:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

const getMyDonorProfile = (req, res) => {
  try {
    const userId = req.user.id;

    const sql = `
      SELECT dp.*, u.full_name, u.email, u.phone, u.role
      FROM donor_profiles dp
      JOIN users u ON dp.user_id = u.id
      WHERE dp.user_id = ?
    `;

    db.query(sql, [userId], (err, result) => {
      if (err) {
        console.error("GET PROFILE ERROR:", err);
        return res.status(500).json({
          message: "Database error",
          error: err.message
        });
      }

      if (result.length === 0) {
        return res.status(404).json({ message: "Donor profile not found" });
      }

      return res.status(200).json({
        donorProfile: result[0]
      });
    });
  } catch (error) {
    console.error("SERVER ERROR:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

const updateMyDonorProfile = (req, res) => {
  try {
    const userId = req.user.id;
    const body = req.body || {};

    const {
      blood_group,
      gender,
      date_of_birth,
      weight,
      address,
      city,
      health_status,
      last_donation_date,
      availability_status
    } = body;

    const sql = `
      UPDATE donor_profiles
      SET blood_group = ?,
          gender = ?,
          date_of_birth = ?,
          weight = ?,
          address = ?,
          city = ?,
          health_status = ?,
          last_donation_date = ?,
          availability_status = ?
      WHERE user_id = ?
    `;

    db.query(
      sql,
      [
        blood_group || null,
        gender || null,
        date_of_birth || null,
        weight || null,
        address || null,
        city || null,
        health_status || null,
        last_donation_date || null,
        availability_status || "available",
        userId
      ],
      (err, result) => {
        if (err) {
          console.error("UPDATE PROFILE ERROR:", err);
          return res.status(500).json({
            message: "Update error",
            error: err.message
          });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Donor profile not found" });
        }

        return res.status(200).json({
          message: "Donor profile updated successfully"
        });
      }
    );
  } catch (error) {
    console.error("SERVER ERROR:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

const getEligibilityStatus = (req, res) => {
  try {
    const userId = req.user.id;

    const sql = `
      SELECT weight, health_status, last_donation_date, availability_status
      FROM donor_profiles
      WHERE user_id = ?
    `;

    db.query(sql, [userId], (err, result) => {
      if (err) {
        console.error("ELIGIBILITY ERROR:", err);
        return res.status(500).json({
          message: "Database error",
          error: err.message
        });
      }

      if (result.length === 0) {
        return res.status(404).json({ message: "Donor profile not found" });
      }

      const profile = result[0];

      let eligible = true;
      let reasons = [];

      if (!profile.weight || Number(profile.weight) < 50) {
        eligible = false;
        reasons.push("Weight must be at least 50 kg");
      }

      if (
        profile.health_status &&
        profile.health_status.toLowerCase() !== "healthy"
      ) {
        eligible = false;
        reasons.push("Health status is not eligible");
      }

      if (
        profile.availability_status &&
        profile.availability_status.toLowerCase() !== "available"
      ) {
        eligible = false;
        reasons.push("Donor is not currently available");
      }

      if (profile.last_donation_date) {
        const lastDate = new Date(profile.last_donation_date);
        const today = new Date();
        const diffTime = today - lastDate;
        const diffDays = diffTime / (1000 * 60 * 60 * 24);

        if (diffDays < 90) {
          eligible = false;
          reasons.push("At least 90 days gap is required after last donation");
        }
      }

      return res.status(200).json({
        eligible,
        reasons
      });
    });
  } catch (error) {
    console.error("SERVER ERROR:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

const getDonorDashboard = (req, res) => {
  try {
    const userId = req.user.id;

    const profileSql = `
      SELECT dp.blood_group, dp.city, dp.availability_status, dp.verified, u.full_name
      FROM donor_profiles dp
      JOIN users u ON dp.user_id = u.id
      WHERE dp.user_id = ?
    `;

    db.query(profileSql, [userId], (err, result) => {
      if (err) {
        console.error("DASHBOARD ERROR:", err);
        return res.status(500).json({
          message: "Database error",
          error: err.message
        });
      }

      if (result.length === 0) {
        return res.status(404).json({ message: "Donor profile not found" });
      }

      const profile = result[0];

      const dashboardData = {
        full_name: profile.full_name,
        blood_group: profile.blood_group,
        city: profile.city,
        availability_status: profile.availability_status,
        verified: profile.verified,
        total_notifications: 0,
        total_messages: 0,
        available_requests: 0
      };

      return res.status(200).json({
        dashboard: dashboardData
      });
    });
  } catch (error) {
    console.error("SERVER ERROR:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

module.exports = {
  addDonorProfile,
  getMyDonorProfile,
  updateMyDonorProfile,
  getEligibilityStatus,
  getDonorDashboard
};