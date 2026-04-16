const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// ================= REGISTER =================
const registerUser = async (req, res) => {
  try {
    const { full_name, email, password, role } = req.body;

    if (!full_name || !email || !password || !role) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const allowedRoles = ["recipient", "donor"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid role selected",
      });
    }

    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
      if (err) {
        return res.status(500).json({
          message: "Database error",
          error: err.message,
        });
      }

      if (result.length > 0) {
        return res.status(400).json({
          message: "Email already exists",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const sql = `
        INSERT INTO users (full_name, email, password, role)
        VALUES (?, ?, ?, ?)
      `;

      db.query(sql, [full_name, email, hashedPassword, role], (err, insertResult) => {
        if (err) {
          return res.status(500).json({
            message: "Registration failed",
            error: err.message,
          });
        }

        return res.status(201).json({
          message: "User registered successfully",
          userId: insertResult.insertId,
        });
      });
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ================= LOGIN =================
const loginUser = (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
      if (err) {
        return res.status(500).json({
          message: "Database error",
          error: err.message,
        });
      }

      if (result.length === 0) {
        return res.status(401).json({
          message: "Invalid email or password",
        });
      }

      const user = result[0];

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({
          message: "Invalid email or password",
        });
      }

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET || "bloodlinksecret",
        { expiresIn: "1d" }
      );

      return res.status(200).json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          role: user.role,
        },
      });
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ================= GET ME =================
const getMe = (req, res) => {
  try {
    return res.status(200).json({
      user: req.user,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
};