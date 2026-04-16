const db = require("../config/db");

const addRecipientProfile = (req, res) => {
  try {
    const userId = req.user.id;
    const body = req.body || {};

    const {
      hospital_name,
      patient_name,
      relation_to_patient,
      address,
      city
    } = body;

    const checkSql = "SELECT * FROM recipient_profiles WHERE user_id = ?";

    db.query(checkSql, [userId], (err, result) => {
      if (err) {
        return res.status(500).json({
          message: "Database error",
          error: err.message
        });
      }

      if (result.length > 0) {
        return res.status(400).json({
          message: "Recipient profile already exists"
        });
      }

      const insertSql = `
        INSERT INTO recipient_profiles
        (user_id, hospital_name, patient_name, relation_to_patient, address, city)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      db.query(
        insertSql,
        [
          userId,
          hospital_name || null,
          patient_name || null,
          relation_to_patient || null,
          address || null,
          city || null
        ],
        (err, result) => {
          if (err) {
            return res.status(500).json({
              message: "Insert error",
              error: err.message
            });
          }

          return res.status(201).json({
            message: "Recipient profile created successfully",
            profileId: result.insertId
          });
        }
      );
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

const createBloodRequest = (req, res) => {
  try {
    const userId = req.user.id;
    const body = req.body || {};

    const {
      blood_group,
      units_required,
      urgency,
      hospital_name,
      location,
      required_date
    } = body;

    if (!blood_group || !units_required || !urgency) {
      return res.status(400).json({
        message: "blood_group, units_required and urgency are required"
      });
    }

    const sql = `
      INSERT INTO blood_requests
      (recipient_id, blood_group, units_required, urgency, hospital_name, location, required_date)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [
        userId,
        blood_group,
        units_required,
        urgency,
        hospital_name || null,
        location || null,
        required_date || null
      ],
      (err, result) => {
        if (err) {
          return res.status(500).json({
            message: "Insert error",
            error: err.message
          });
        }

        return res.status(201).json({
          message: "Blood request created successfully",
          requestId: result.insertId
        });
      }
    );
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

const getMyRequests = (req, res) => {
  try {
    const userId = req.user.id;

    const sql = `
      SELECT *
      FROM blood_requests
      WHERE recipient_id = ?
      ORDER BY created_at DESC
    `;

    db.query(sql, [userId], (err, result) => {
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

module.exports = {
  addRecipientProfile,
  createBloodRequest,
  getMyRequests
};