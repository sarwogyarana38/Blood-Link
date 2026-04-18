const db = require("../config/db");

// for adding blood unit
const addBloodUnit = (req, res) => {
  try {
    const adminId = req.user.id;
    const body = req.body || {};

    const {
      blood_group,
      units_available,
      collection_date,
      expiry_date,
      status,
    } = body;

    if (!blood_group || !units_available) {
      return res.status(400).json({
        message: "blood_group and units_available are required",
      });
    }

    const sql = `
      INSERT INTO blood_inventory
      (blood_group, units_available, collection_date, expiry_date, added_by, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [
        blood_group,
        units_available,
        collection_date || null,
        expiry_date || null,
        adminId,
        status || "available",
      ],
      (err, result) => {
        if (err) {
          return res.status(500).json({
            message: "Insert error",
            error: err.message,
          });
        }

        return res.status(201).json({
          message: "Blood stock added successfully",
          inventoryId: result.insertId,
        });
      }
    );
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// helper for expiry label
const getExpiryStatus = (expiryDate) => {
  if (!expiryDate) return "No Expiry";

  const today = new Date();
  const exp = new Date(expiryDate);

  today.setHours(0, 0, 0, 0);
  exp.setHours(0, 0, 0, 0);

  const diffTime = exp - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "Expired";
  if (diffDays <= 7) return "Expiring Soon";
  return "Safe";
};

// for viewing all blood stock
const getAllBloodStock = (req, res) => {
  try {
    const sql = `
      SELECT bi.*, u.full_name AS added_by_name
      FROM blood_inventory bi
      LEFT JOIN users u ON bi.added_by = u.id
      ORDER BY bi.created_at DESC
    `;

    db.query(sql, (err, result) => {
      if (err) {
        return res.status(500).json({
          message: "Database error",
          error: err.message,
        });
      }

      const stockWithExpiry = result.map((item) => ({
        ...item,
        expiry_tracker: getExpiryStatus(item.expiry_date),
      }));

      return res.status(200).json({
        stock: stockWithExpiry,
      });
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// for update stock
const updateBloodStock = (req, res) => {
  try {
    const inventoryId = req.params.id;
    const body = req.body || {};

    const {
      blood_group,
      units_available,
      collection_date,
      expiry_date,
      status,
    } = body;

    const sql = `
      UPDATE blood_inventory
      SET blood_group = ?,
          units_available = ?,
          collection_date = ?,
          expiry_date = ?,
          status = ?
      WHERE id = ?
    `;

    db.query(
      sql,
      [
        blood_group || null,
        units_available || 0,
        collection_date || null,
        expiry_date || null,
        status || "available",
        inventoryId,
      ],
      (err, result) => {
        if (err) {
          return res.status(500).json({
            message: "Update error",
            error: err.message,
          });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({
            message: "Inventory record not found",
          });
        }

        return res.status(200).json({
          message: "Blood stock updated successfully",
        });
      }
    );
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// for checking expiry tracker
const getExpiringBloodStock = (req, res) => {
  try {
    const sql = `
      SELECT *
      FROM blood_inventory
      WHERE expiry_date IS NOT NULL
        AND expiry_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
      ORDER BY expiry_date ASC
    `;

    db.query(sql, (err, result) => {
      if (err) {
        return res.status(500).json({
          message: "Database error",
          error: err.message,
        });
      }

      const expiringStock = result.map((item) => ({
        ...item,
        expiry_tracker: getExpiryStatus(item.expiry_date),
      }));

      return res.status(200).json({
        expiringStock,
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
  addBloodUnit,
  getAllBloodStock,
  updateBloodStock,
  getExpiringBloodStock,
};