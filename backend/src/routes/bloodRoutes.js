const express = require("express");
const router = express.Router();
const db = require("../config/db");

/**
 * SEARCH BLOOD (USED BY RECIPIENT)
 */
router.get("/search", (req, res) => {
  const { bloodGroup } = req.query;

  if (!bloodGroup) {
    return res.status(400).json({
      message: "bloodGroup is required",
    });
  }

  const sql = `
    SELECT 
      blood_group,
      SUM(units_available) AS units,
      status
    FROM blood_inventory
    WHERE blood_group = ? AND status = 'available'
    GROUP BY blood_group, status
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
});

/**
 * GET ALL INVENTORY (FOR ADMIN PANEL)
 */
router.get("/", (req, res) => {
  const sql = `SELECT * FROM blood_inventory ORDER BY id DESC`;

  db.query(sql, (err, result) => {
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
});

/**
 * ADD INVENTORY
 */
router.post("/", (req, res) => {
  const { blood_group, units, status } = req.body;

  if (!blood_group || !units || !status) {
    return res.status(400).json({
      message: "blood_group, units and status are required",
    });
  }

  const sql = `
    INSERT INTO blood_inventory (blood_group, units_available, status)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [blood_group, units, status], (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Database error",
        error: err.message,
      });
    }

    return res.status(201).json({
      message: "Inventory added successfully",
      id: result.insertId,
    });
  });
});

/**
 * UPDATE INVENTORY
 */
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { blood_group, units, status } = req.body;

  const sql = `
    UPDATE blood_inventory 
    SET blood_group = ?, units_available = ?, status = ?
    WHERE id = ?
  `;

  db.query(sql, [blood_group, units, status, id], (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Database error",
        error: err.message,
      });
    }

    return res.status(200).json({
      message: "Inventory updated successfully",
    });
  });
});

/**
 * DELETE INVENTORY
 */
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  const sql = `DELETE FROM blood_inventory WHERE id = ?`;

  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Database error",
        error: err.message,
      });
    }

    return res.status(200).json({
      message: "Inventory deleted successfully",
    });
  });
});

module.exports = router;