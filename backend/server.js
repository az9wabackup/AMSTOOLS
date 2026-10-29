const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const orderRoutes = require("./routes/orders");

const adminAuthRoutes = require("./routes/adminAuth");
const adminRoutes = require("./routes/admin");

const wishlistRoutes = require("./routes/wishlist");
const reviewRoutes = require("./routes/reviews");
const uploadRoutes = require("./routes/upload");
const verifyAdminToken = require("./middleware/adminAuth");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);

app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin", verifyAdminToken, adminRoutes);

console.log("ORDER ROUTES LOADED");
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/upload", uploadRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "AMS TOOLS Backend is running!"
  });
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(
    `AMS TOOLS Backend running on http://localhost:${PORT}`
  );
});