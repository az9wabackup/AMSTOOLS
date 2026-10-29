const express = require("express");
const db = require("../db");

const router = express.Router();

router.post("/create", async (req, res) => {
  try {
    const {
      customerId,
      totalAmount,
      fullName,
      phone,
      address,
      city,
      state,
      pincode,
      items,
    } = req.body;

    if (
      !customerId ||
      !totalAmount ||
      !fullName ||
      !phone ||
      !address ||
      !city ||
      !state ||
      !pincode ||
      !items ||
      items.length === 0
    ) {
      return res.status(400).json({
        message: "Missing order details.",
      });
    }

    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      const [orderResult] = await connection.execute(
        `INSERT INTO orders
        (
          customer_id,
          total_amount,
          payment_status,
          order_status,
          full_name,
          phone,
          address,
          city,
          state,
          pincode
        )
        VALUES (?, ?, 'PENDING', 'PLACED', ?, ?, ?, ?, ?, ?)`,
        [
          customerId,
          totalAmount,
          fullName,
          phone,
          address,
          city,
          state,
          pincode,
        ]
      );

      const orderId = orderResult.insertId;

      for (const item of items) {
        await connection.execute(
          `INSERT INTO order_items
          (
            order_id,
            product_id,
            product_name,
            quantity,
            price
          )
          VALUES (?, ?, ?, ?, ?)`,
          [
            orderId,
            item.id,
            item.name,
            item.quantity,
            item.price,
          ]
        );
      }

      await connection.commit();

      res.status(201).json({
        message: "Order created successfully.",
        orderId,
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error("ORDER ERROR:", error);

    res.status(500).json({
      message: "Unable to create order.",
    });
  }
});

// =========================
// GET CUSTOMER ORDERS
// =========================

router.get("/customer/:customerId", async (req, res) => {
  try {
    const { customerId } = req.params;

    const [orders] = await db.execute(
      `SELECT
        order_id,
        total_amount,
        payment_status,
        order_status,
        full_name,
        phone,
        address,
        city,
        state,
        pincode,
        dtdc_tracking,
        created_at
       FROM orders
       WHERE customer_id = ?
       ORDER BY created_at DESC`,
      [customerId]
    );

    res.json({
      orders,
    });

  } catch (error) {
    console.error("GET ORDERS ERROR:", error);

    res.status(500).json({
      message: "Unable to load orders.",
    });
  }
});

// =========================
// GET SINGLE ORDER DETAILS
// =========================

router.get("/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;

    const [orders] = await db.execute(
      `SELECT
        order_id,
        customer_id,
        total_amount,
        payment_status,
        order_status,
        full_name,
        phone,
        address,
        city,
        state,
        pincode,
        dtdc_tracking,
        created_at
       FROM orders
       WHERE order_id = ?`,
      [orderId]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        message: "Order not found.",
      });
    }

    const [items] = await db.execute(
      `SELECT
        order_item_id,
        product_id,
        product_name,
        quantity,
        price
       FROM order_items
       WHERE order_id = ?`,
      [orderId]
    );

    res.json({
      order: orders[0],
      items,
    });

  } catch (error) {
    console.error("GET ORDER DETAILS ERROR:", error);

    res.status(500).json({
      message: "Unable to load order details.",
    });
  }
});

module.exports = router;