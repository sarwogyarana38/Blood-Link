const express = require("express");
const cors = require("cors");
require("./config/db");

// Routes
const authRoutes = require("./routes/authRoutes");
const testRoutes = require("./routes/testRoutes");
const donorRoutes = require("./routes/donorRoutes");
const recipientRoutes = require("./routes/recipientRoutes");
const adminRoutes = require("./routes/adminRoutes");
const matchingRoutes = require("./routes/matchingRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const messageRoutes = require("./routes/messageRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const bloodRoutes = require("./routes/bloodRoutes");
const requestRoutes = require("./routes/requestRoutes");
const donorProfileRoutes = require("./routes/donorProfile");


const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Blood Link API is running...");
});

app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/donor", donorRoutes);
app.use("/api/recipient", recipientRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/matching", matchingRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/blood", bloodRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/donor-profile", donorProfileRoutes);


module.exports = app;