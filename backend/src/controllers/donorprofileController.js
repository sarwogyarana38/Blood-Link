const db = require("../config/db");

// CREATE donor profile
exports.createDonorProfile = (req, res) => {
  const userId = req.user.id;

  const {
    full_name,
    phone,
    email,
    date_of_birth,
    gender,
    blood_group,
    address,
    age,
    weight,
    last_donation_date,
    city,
    health_status,
  } = req.body;

  const query = `
    INSERT INTO donor_profiles 
    (user_id, full_name, phone, email, date_of_birth, gender, blood_group, address, age, weight, last_donation_date, city, health_status, availability_status, eligible_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'available', 1)
  `;

  db.query(
    query,
    [
      userId,
      full_name,
      phone,
      email,
      date_of_birth,
      gender,
      blood_group,
      address,
      age,
      weight,
      last_donation_date,
      city,
      health_status,
    ],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to create profile" });
      }

      res.status(200).json({
        message: "Donor profile created successfully",
      });
    }
  );
};

// GET my profile
exports.getMyDonorProfile = (req, res) => {
  const userId = req.user.id;

  db.query(
    "SELECT * FROM donor_profiles WHERE user_id = ?",
    [userId],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Error fetching profile" });
      }

      res.status(200).json({
        data: result[0] || null,
      });
    }
  );
};

// UPDATE profile
exports.updateDonorProfile = (req, res) => {
  const userId = req.user.id;

  const {
    full_name,
    phone,
    email,
    date_of_birth,
    gender,
    blood_group,
    address,
    age,
    weight,
    last_donation_date,
    city,
    health_status,
  } = req.body;

  const query = `
    UPDATE donor_profiles SET
    full_name = ?, phone = ?, email = ?, date_of_birth = ?, gender = ?, blood_group = ?, address = ?, age = ?, weight = ?, last_donation_date = ?, city = ?, health_status = ?
    WHERE user_id = ?
  `;

  db.query(
    query,
    [
      full_name,
      phone,
      email,
      date_of_birth,
      gender,
      blood_group,
      address,
      age,
      weight,
      last_donation_date,
      city,
      health_status,
      userId,
    ],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Failed to update profile" });
      }

      res.status(200).json({
        message: "Profile updated successfully",
      });
    }
  );
};