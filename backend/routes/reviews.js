
const express = require("express");
const db = require("../db");

const router = express.Router();

// =========================
// SUBMIT A PRODUCT REVIEW
// =========================

router.post("/create", async (req, res) => {
  try {
    const { customerId, productId, orderId, rating, comment } = req.body;

    if (
      !Number.isInteger(Number(customerId)) ||
      !Number.isInteger(Number(productId)) ||
      !Number.isInteger(Number(orderId)) ||
      !Number.isInteger(Number(rating)) ||
      Number(rating) < 1 ||
      Number(rating) > 5
    ) {
      return res.status(400).json({
        message: "Provide valid customer, product, order and rating details. Rating must be 1–5.",
      });
    }

    // Confirm that the product belongs to this customer's order.
    const [orderItems] = await db.execute(
      `SELECT o.order_id
       FROM orders o
       JOIN order_items oi ON oi.order_id = o.order_id
       WHERE o.order_id = ?
         AND o.customer_id = ?
         AND oi.product_id = ?`,
      [orderId, customerId, productId]
    );

    if (orderItems.length === 0) {
      return res.status(403).json({
        message: "You can review only products included in your own order.",
      });
    }

    // Prevent reviews for cancelled orders.
    const [orders] = await db.execute(
      `SELECT order_status
       FROM orders
       WHERE order_id = ? AND customer_id = ?`,
      [orderId, customerId]
    );

    if (
      orders.length === 0 ||
      String(orders[0].order_status).toUpperCase() === "CANCELLED"
    ) {
      return res.status(400).json({
        message: "You cannot review this order.",
      });
    }

    const [result] = await db.execute(
      `INSERT INTO reviews
       (customer_id, product_id, order_id, rating, comment)
       VALUES (?, ?, ?, ?, ?)`,
      [
        Number(customerId),
        Number(productId),
        Number(orderId),
        Number(rating),
        comment ? String(comment).trim() : null,
      ]
    );

    res.status(201).json({
      message: "Review submitted. It will appear after admin approval.",
      reviewId: result.insertId,
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "You have already reviewed this product for this order.",
      });
    }

    console.error("CREATE REVIEW ERROR:", error);

    res.status(500).json({
      message: "Unable to submit review.",
    });
  }
});

// =========================
// GET APPROVED REVIEWS FOR A PRODUCT
// =========================

router.get("/product/:productId", async (req, res) => {
  try {
    const productId = Number(req.params.productId);

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({
        message: "Invalid product ID.",
      });
    }

    const [reviews] = await db.execute(
      `SELECT
         r.review_id,
         r.rating,
         r.comment,
         r.created_at,
         c.full_name AS customer_name
       FROM reviews r
       JOIN customers c ON c.customer_id = r.customer_id
       WHERE r.product_id = ?
         AND r.status = 'APPROVED'
       ORDER BY r.created_at DESC`,
      [productId]
    );

    res.json({ reviews });
  } catch (error) {
    console.error("GET REVIEWS ERROR:", error);

    res.status(500).json({
      message: "Unable to load reviews.",
    });
  }
});

module.exports = router;
