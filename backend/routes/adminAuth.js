const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");

const router = express.Router();

// =========================
// ADMIN LOGIN
// =========================

router.post("/login", async (req, res) => {
  try {
    const { phone, mpin } = req.body;

    if (!phone || !mpin) {
      return res.status(400).json({
        message: "Phone number and M-PIN are required.",
      });
    }

    const [rows] = await db.execute(
      "SELECT * FROM admins WHERE phone = ?",
      [phone]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        message: "Invalid phone number or M-PIN.",
      });
    }

    const admin = rows[0];

    if (admin.status !== "ACTIVE") {
      return res.status(403).json({
        message: "Admin account is blocked.",
      });
    }

    const validMpin = await bcrypt.compare(
      mpin,
      admin.mpin_hash
    );

    if (!validMpin) {
      return res.status(401).json({
        message: "Invalid phone number or M-PIN.",
      });
    }

    const token = jwt.sign(
      {
        adminId: admin.admin_id,
        phone: admin.phone,
        role: "ADMIN",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      message: "Admin login successful.",
      token,
      admin: {
        id: admin.admin_id,
        fullName: admin.full_name,
        phone: admin.phone,
      },
    });

  } catch (error) {
    console.error("ADMIN LOGIN ERROR:", error);

    res.status(500).json({
      message: "Server error.",
    });
  }
});

module.exports = router;