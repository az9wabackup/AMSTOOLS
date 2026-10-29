const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");

const router = express.Router();

// =========================
// SIGNUP
// =========================

router.post("/signup", async (req, res) => {
  try {
    const { fullName, phone, mpin } = req.body;

    if (!fullName || !phone || !mpin) {
      return res.status(400).json({
        message: "All fields are required.",
      });
    }

    const [existing] = await db.execute(
      "SELECT customer_id FROM customers WHERE phone = ?",
      [phone]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        message: "Phone number already registered.",
      });
    }

    const mpinHash = await bcrypt.hash(mpin, 10);

    const [result] = await db.execute(
      `INSERT INTO customers
       (full_name, phone, mpin_hash)
       VALUES (?, ?, ?)`,
      [fullName, phone, mpinHash]
    );

    res.status(201).json({
      message: "Account created successfully.",
      customerId: result.insertId,
    });

  } catch (error) {
    console.error("SIGNUP ERROR:", error);

    res.status(500).json({
      message: "Server error.",
    });
  }
});


// =========================
// LOGIN
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
      "SELECT * FROM customers WHERE phone = ?",
      [phone]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        message: "Invalid phone number or M-PIN.",
      });
    }

    const customer = rows[0];

    if (customer.status !== "ACTIVE") {
      return res.status(403).json({
        message: "Your account is blocked.",
      });
    }

    const validMpin = await bcrypt.compare(
      mpin,
      customer.mpin_hash
    );

    if (!validMpin) {
      return res.status(401).json({
        message: "Invalid phone number or M-PIN.",
      });
    }

    const token = jwt.sign(
      {
        customerId: customer.customer_id,
        phone: customer.phone,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      message: "Login successful.",
      token,
      customer: {
        id: customer.customer_id,
        fullName: customer.full_name,
        phone: customer.phone,
      },
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);

    res.status(500).json({
      message: "Server error.",
    });
  }
});


module.exports = router;