const db = require("../config/db");
const { createNotification } = require("./notificationController");

const createRequest = (req, res) => {
  try {
    const { blood_group, units_required, urgency, hospital_name, required_date } = req.body;
    const recipient_id = req.user.id;

    if (!blood_group || !units_required) {
      return res.status(400).json({
        message: "blood_group and units_required are required",
      });
    }

    const requestedUnits = Number(units_required);

    if (Number.isNaN(requestedUnits) || requestedUnits <= 0) {
      return res.status(400).json({
        message: "units_required must be greater than 0",
      });
    }

    const stockSql = `
      SELECT COALESCE(SUM(units_available), 0) AS total_units
      FROM blood_inventory
      WHERE blood_group = ? AND status = 'available'
    `;

    db.query(stockSql, [blood_group], (err, stockResult) => {
      if (err) {
        return res.status(500).json({
          message: "Stock check error",
          error: err.message,
        });
      }

      const availableUnits = Number(stockResult[0]?.total_units || 0);

      if (availableUnits < requestedUnits) {
        return res.status(400).json({
          message: `Only ${availableUnits} unit(s) available`,
        });
      }

      const insertSql = `
        INSERT INTO blood_requests
        (recipient_id, blood_group, units_required, urgency, hospital_name, required_date, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      db.query(
        insertSql,
        [
          recipient_id,
          blood_group,
          requestedUnits,
          urgency || "normal",
          hospital_name || null,
          required_date || null,
          "pending",
        ],
        async (err, result) => {
          if (err) {
            return res.status(500).json({
              message: "Insert error",
              error: err.message,
            });
          }

          try {
            await createNotification(
              recipient_id,
              "Blood request submitted",
              `Your request for ${requestedUnits} unit(s) of ${blood_group} has been submitted successfully.`,
              "request"
            );
          } catch (notificationError) {
            console.error("Notification error:", notificationError.message);
          }

          return res.status(201).json({
            message: "Blood request created successfully",
            requestId: result.insertId,
          });
        }
      );
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const getAllRequests = (req, res) => {
  try {
    const sql = `
      SELECT
        br.id,
        br.recipient_id,
        br.blood_group,
        br.units_required,
        br.urgency,
        br.hospital_name,
        br.required_date,
        br.status,
        br.created_at,
        u.full_name,
        u.email
      FROM blood_requests br
      JOIN users u ON br.recipient_id = u.id
      ORDER BY br.id DESC
    `;

    db.query(sql, (err, result) => {
      if (err) {
        return res.status(500).json({
          message: "Fetch error",
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

const getMyRequests = (req, res) => {
  try {
    const sql = `
      SELECT
        id,
        blood_group,
        units_required,
        urgency,
        hospital_name,
        required_date,
        status,
        created_at
      FROM blood_requests
      WHERE recipient_id = ?
      ORDER BY id DESC
    `;

    db.query(sql, [req.user.id], (err, result) => {
      if (err) {
        return res.status(500).json({
          message: "Fetch error",
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

const updateRequestStatus = (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        message: "status is required",
      });
    }

    const allowedStatuses = ["pending", "approved", "rejected", "completed"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status value",
      });
    }

    const getRequestSql = `
      SELECT id, recipient_id, blood_group, units_required, status
      FROM blood_requests
      WHERE id = ?
    `;

    db.query(getRequestSql, [id], (err, result) => {
      if (err) {
        return res.status(500).json({
          message: "Fetch error",
          error: err.message,
        });
      }

      if (result.length === 0) {
        return res.status(404).json({
          message: "Request not found",
        });
      }

      const request = result[0];
      const requiredUnits = Number(request.units_required);

      const notifyRecipient = async (newStatus) => {
        let title = "Request updated";
        let message = `Your blood request for ${request.blood_group} has been updated to ${newStatus}.`;
        let type = "status";

        if (newStatus === "approved") {
          title = "Request approved";
          message = `Your request for ${requiredUnits} unit(s) of ${request.blood_group} has been approved.`;
          type = "success";
        } else if (newStatus === "rejected") {
          title = "Request rejected";
          message = `Your request for ${requiredUnits} unit(s) of ${request.blood_group} has been rejected.`;
          type = "warning";
        } else if (newStatus === "completed") {
          title = "Request completed";
          message = `Your request for ${requiredUnits} unit(s) of ${request.blood_group} has been completed.`;
          type = "success";
        }

        try {
          await createNotification(request.recipient_id, title, message, type);
        } catch (notificationError) {
          console.error("Notification error:", notificationError.message);
        }
      };

      if (status === "approved" && request.status !== "approved") {
        const stockCheckSql = `
          SELECT COALESCE(SUM(units_available), 0) AS total_units
          FROM blood_inventory
          WHERE blood_group = ? AND status = 'available'
        `;

        db.query(stockCheckSql, [request.blood_group], (err, stockResult) => {
          if (err) {
            return res.status(500).json({
              message: "Stock check error",
              error: err.message,
            });
          }

          const availableUnits = Number(stockResult[0]?.total_units || 0);

          if (availableUnits < requiredUnits) {
            return res.status(400).json({
              message: `Not enough stock to approve. Only ${availableUnits} unit(s) available.`,
            });
          }

          const deductSql = `
            UPDATE blood_inventory
            SET units_available = units_available - ?
            WHERE blood_group = ?
              AND status = 'available'
              AND units_available >= ?
            ORDER BY id ASC
            LIMIT 1
          `;

          db.query(
            deductSql,
            [requiredUnits, request.blood_group, requiredUnits],
            (err, deductResult) => {
              if (err) {
                return res.status(500).json({
                  message: "Inventory update error",
                  error: err.message,
                });
              }

              if (deductResult.affectedRows === 0) {
                return res.status(400).json({
                  message: "Could not deduct stock from inventory",
                });
              }

              const updateStatusSql = `
                UPDATE blood_requests
                SET status = ?
                WHERE id = ?
              `;

              db.query(updateStatusSql, [status, id], async (err) => {
                if (err) {
                  return res.status(500).json({
                    message: "Status update error",
                    error: err.message,
                  });
                }

                await notifyRecipient(status);

                return res.status(200).json({
                  message: "Request approved and inventory updated successfully",
                });
              });
            }
          );
        });
      } else {
        const sql = `
          UPDATE blood_requests
          SET status = ?
          WHERE id = ?
        `;

        db.query(sql, [status, id], async (err, updateResult) => {
          if (err) {
            return res.status(500).json({
              message: "Update error",
              error: err.message,
            });
          }

          if (updateResult.affectedRows === 0) {
            return res.status(404).json({
              message: "Request not found",
            });
          }

          await notifyRecipient(status);

          return res.status(200).json({
            message: "Request status updated successfully",
          });
        });
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  createRequest,
  getAllRequests,
  getMyRequests,
  updateRequestStatus,
};