const express = require("express");
const db = require("../db");

const router = express.Router();

// =========================
// ADMIN DASHBOARD STATS
// =========================

router.get("/dashboard", async (req, res) => {
  try {
    const [[orders]] = await db.execute(
      "SELECT COUNT(*) AS totalOrders FROM orders"
    );

    const [[customers]] = await db.execute(
      "SELECT COUNT(*) AS totalCustomers FROM customers"
    );

    const [[products]] = await db.execute(
      "SELECT COUNT(*) AS totalProducts FROM products"
    );

    const [[lowStock]] = await db.execute(
      "SELECT COUNT(*) AS lowStock FROM products WHERE stock <= 5 AND active = 1"
    );

    const [[sales]] = await db.execute(
      `SELECT COALESCE(SUM(total_amount), 0) AS totalSales
       FROM orders
       WHERE payment_status = 'PAID'`
    );

    res.json({
      totalOrders: orders.totalOrders,
      totalCustomers: customers.totalCustomers,
      totalProducts: products.totalProducts,
      lowStock: lowStock.lowStock,
      totalSales: sales.totalSales,
    });

  } catch (error) {
    console.error("DASHBOARD ERROR:", error);

    res.status(500).json({
      message: "Unable to load dashboard.",
    });
  }
});


// =========================
// GET ALL PRODUCTS
// =========================

router.get("/products", async (req, res) => {
  try {
    const [products] = await db.execute(
      `SELECT
        product_id,
        name,
        description,
        price,
        stock,
        type,
        discount,
        image_url,
        active,
        created_at,
        updated_at
       FROM products
       ORDER BY product_id DESC`
    );

    res.json({
      products,
    });

  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);

    res.status(500).json({
      message: "Unable to load products.",
    });
  }
});


// =========================
// ADD PRODUCT
// =========================

router.post("/products", async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      stock,
      type,
      discount,
      image_url,
      active,
    } = req.body;

    // Required fields
    if (
      !name ||
      price === undefined ||
      stock === undefined ||
      !type
    ) {
      return res.status(400).json({
        message: "Name, price, stock and type are required.",
      });
    }

    // Validate product type
    if (!["SINGLE", "COMBO"].includes(type)) {
      return res.status(400).json({
        message: "Product type must be SINGLE or COMBO.",
      });
    }

    // Prevent duplicate product
    const [existing] = await db.execute(
      `SELECT product_id
       FROM products
       WHERE LOWER(name) = LOWER(?)`,
      [name.trim()]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        message: "A product with this name already exists.",
      });
    }

    const [result] = await db.execute(
      `INSERT INTO products
      (
        name,
        description,
        price,
        stock,
        type,
        discount,
        image_url,
        active
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name.trim(),
        description || "",
        Number(price),
        Number(stock),
        type,
        Number(discount || 0),
        image_url || null,
        active === undefined ? true : Boolean(active),
      ]
    );

    res.status(201).json({
      message: "Product created successfully.",
      productId: result.insertId,
    });

  } catch (error) {
    console.error("ADD PRODUCT ERROR:", error);

    res.status(500).json({
      message: "Unable to create product.",
    });
  }
});

// =========================
// UPDATE PRODUCT
// =========================

router.put("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      description,
      price,
      stock,
      type,
      discount,
      image_url,
      active,
    } = req.body;

    if (
      !name ||
      price === undefined ||
      stock === undefined ||
      !type
    ) {
      return res.status(400).json({
        message: "Name, price, stock and type are required.",
      });
    }

    if (!["SINGLE", "COMBO"].includes(type)) {
      return res.status(400).json({
        message: "Product type must be SINGLE or COMBO.",
      });
    }

    // Check whether another product already has this name
    const [existing] = await db.execute(
      `SELECT product_id
       FROM products
       WHERE LOWER(name) = LOWER(?)
       AND product_id != ?`,
      [name.trim(), id]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        message: "Another product with this name already exists.",
      });
    }

    const [result] = await db.execute(
      `UPDATE products
       SET
         name = ?,
         description = ?,
         price = ?,
         stock = ?,
         type = ?,
         discount = ?,
         image_url = ?,
         active = ?
       WHERE product_id = ?`,
      [
        name.trim(),
        description || "",
        Number(price),
        Number(stock),
        type,
        Number(discount || 0),
        image_url || null,
        active === undefined ? true : Boolean(active),
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    res.json({
      message: "Product updated successfully.",
    });

  } catch (error) {
    console.error("UPDATE PRODUCT ERROR:", error);

    res.status(500).json({
      message: "Unable to update product.",
    });
  }
});


// =========================
// UPDATE PRODUCT STOCK
// =========================

router.put("/products/:id/stock", async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;

    if (stock === undefined || stock === null) {
      return res.status(400).json({
        message: "Stock is required.",
      });
    }

    if (Number(stock) < 0) {
      return res.status(400).json({
        message: "Stock cannot be negative.",
      });
    }

    const [result] = await db.execute(
      `UPDATE products
       SET stock = ?
       WHERE product_id = ?`,
      [Number(stock), id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    res.json({
      message: "Stock updated successfully.",
      stock: Number(stock),
    });

  } catch (error) {
    console.error("UPDATE STOCK ERROR:", error);

    res.status(500).json({
      message: "Unable to update stock.",
    });
  }
});


// =========================
// GET ALL ORDERS - ADMIN
// =========================

router.get("/orders", async (req, res) => {
  try {
    const [orders] = await db.execute(
      `SELECT
        o.order_id,
        o.customer_id,
        o.total_amount,
        o.payment_status,
        o.order_status,
        o.full_name,
        o.phone,
        o.address,
        o.city,
        o.state,
        o.pincode,
        o.dtdc_tracking,
        o.created_at,
        c.full_name AS customer_name
       FROM orders o
       JOIN customers c
         ON o.customer_id = c.customer_id
       ORDER BY o.created_at DESC`
    );

    res.json({
      orders,
    });

  } catch (error) {
    console.error("ADMIN GET ORDERS ERROR:", error);

    res.status(500).json({
      message: "Unable to load orders.",
    });
  }
});

// =========================
// GET SINGLE ORDER - ADMIN
// =========================

router.get("/orders/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;

    const [orders] = await db.execute(
      `SELECT
        o.order_id,
        o.customer_id,
        o.total_amount,
        o.payment_status,
        o.order_status,
        o.full_name,
        o.phone,
        o.address,
        o.city,
        o.state,
        o.pincode,
        o.dtdc_tracking,
        o.created_at,
        c.full_name AS customer_name
       FROM orders o
       JOIN customers c
         ON o.customer_id = c.customer_id
       WHERE o.order_id = ?`,
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
    console.error(
      "ADMIN GET ORDER DETAILS ERROR:",
      error
    );

    res.status(500).json({
      message: "Unable to load order details.",
    });
  }
});

// =========================
// UPDATE ORDER STATUS
// =========================

router.put("/orders/:orderId/status", async (req, res) => {
  try {
    const { orderId } = req.params;
    const { order_status } = req.body;

    const allowedStatuses = [
      "PLACED",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ];

    if (!allowedStatuses.includes(order_status)) {
      return res.status(400).json({
        message: "Invalid order status.",
      });
    }

    const [result] = await db.execute(
      `UPDATE orders
       SET order_status = ?
       WHERE order_id = ?`,
      [order_status, orderId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Order not found.",
      });
    }

    res.json({
      message: "Order status updated successfully.",
      orderStatus: order_status,
    });

  } catch (error) {
    console.error("UPDATE ORDER STATUS ERROR:", error);

    res.status(500).json({
      message: "Unable to update order status.",
    });
  }
});

// =========================
// UPDATE PAYMENT STATUS
// =========================

router.put("/orders/:orderId/payment", async (req, res) => {
  try {
    const { orderId } = req.params;
    const { payment_status } = req.body;

    const allowedStatuses = [
      "PENDING",
      "PAID",
      "FAILED",
    ];

    if (!allowedStatuses.includes(payment_status)) {
      return res.status(400).json({
        message: "Invalid payment status.",
      });
    }

    const [result] = await db.execute(
      `UPDATE orders
       SET payment_status = ?
       WHERE order_id = ?`,
      [payment_status, orderId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Order not found.",
      });
    }

    res.json({
      message: "Payment status updated successfully.",
      paymentStatus: payment_status,
    });

  } catch (error) {
    console.error(
      "UPDATE PAYMENT STATUS ERROR:",
      error
    );

    res.status(500).json({
      message: "Unable to update payment status.",
    });
  }
});


// =========================
// UPDATE DTDC TRACKING
// =========================

router.put("/orders/:orderId/tracking", async (req, res) => {
  try {
    const { orderId } = req.params;
    const { dtdc_tracking } = req.body;

    const trackingNumber = dtdc_tracking
      ? dtdc_tracking.trim()
      : "";

    const [result] = await db.execute(
      `UPDATE orders
       SET dtdc_tracking = ?
       WHERE order_id = ?`,
      [trackingNumber || null, orderId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Order not found.",
      });
    }

    res.json({
      message: "DTDC tracking updated successfully.",
      tracking: trackingNumber || null,
    });

  } catch (error) {
    console.error(
      "UPDATE DTDC TRACKING ERROR:",
      error
    );

    res.status(500).json({
      message: "Unable to update DTDC tracking.",
    });
  }
});

// =========================
// GET ALL CUSTOMERS - ADMIN
// =========================

router.get("/customers", async (req, res) => {
  try {
    const [customers] = await db.execute(
      `SELECT
        c.customer_id,
        c.full_name,
        c.phone,
        c.status,
        c.created_at,
        COUNT(o.order_id) AS total_orders,
        COALESCE(SUM(
          CASE
            WHEN o.payment_status = 'PAID'
            THEN o.total_amount
            ELSE 0
          END
        ), 0) AS total_spent
       FROM customers c
       LEFT JOIN orders o
         ON c.customer_id = o.customer_id
       GROUP BY
         c.customer_id,
         c.full_name,
         c.phone,
         c.status,
         c.created_at
       ORDER BY c.created_at DESC`
    );

    res.json({
      customers,
    });

  } catch (error) {
    console.error(
      "ADMIN GET CUSTOMERS ERROR:",
      error
    );

    res.status(500).json({
      message: "Unable to load customers.",
    });
  }
});


// =========================
// GET CUSTOMER ORDER HISTORY - ADMIN
// =========================

router.get("/customers/:customerId/orders", async (req, res) => {
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
    console.error(
      "ADMIN CUSTOMER ORDERS ERROR:",
      error
    );

    res.status(500).json({
      message: "Unable to load customer orders.",
    });
  }
});


// =========================
// ADMIN REPORTS
// =========================

router.get("/reports", async (req, res) => {
  try {
    const [[summary]] = await db.execute(`
      SELECT
        COUNT(*) AS total_orders,

        COALESCE(SUM(
          CASE
            WHEN payment_status = 'PAID'
            THEN total_amount
            ELSE 0
          END
        ), 0) AS total_sales,

        COUNT(
          CASE
            WHEN payment_status = 'PAID'
            THEN 1
          END
        ) AS paid_orders,

        COUNT(
          CASE
            WHEN payment_status = 'PENDING'
            THEN 1
          END
        ) AS pending_orders,

        COUNT(
          CASE
            WHEN order_status = 'CANCELLED'
            THEN 1
          END
        ) AS cancelled_orders

      FROM orders
    `);

    const [productSales] = await db.execute(`
      SELECT
        product_id,
        product_name,
        SUM(quantity) AS quantity_sold,
        COALESCE(SUM(quantity * price), 0) AS sales_amount
      FROM order_items
      GROUP BY product_id, product_name
      ORDER BY quantity_sold DESC
    `);

    const [customerSales] = await db.execute(`
      SELECT
        c.customer_id,
        c.full_name,
        c.phone,
        COUNT(o.order_id) AS total_orders,
        COALESCE(SUM(
          CASE
            WHEN o.payment_status = 'PAID'
            THEN o.total_amount
            ELSE 0
          END
        ), 0) AS total_spent
      FROM customers c
      LEFT JOIN orders o
        ON c.customer_id = o.customer_id
      GROUP BY
        c.customer_id,
        c.full_name,
        c.phone
      ORDER BY total_spent DESC
    `);

    res.json({
      summary,
      productSales,
      customerSales,
    });

  } catch (error) {
    console.error("ADMIN REPORTS ERROR:", error);

    res.status(500).json({
      message: "Unable to load reports.",
    });
  }
});

// =========================
// GET ACTIVE PRODUCTS - CUSTOMER
// =========================

router.get("/customer-products", async (req, res) => {
  try {
    const [products] = await db.execute(
      `SELECT
        product_id,
        name,
        description,
        price,
        stock,
        type,
        discount,
        image_url,
        active
       FROM products
       WHERE active = 1
       ORDER BY product_id DESC`
    );

    res.json({
      products,
    });

  } catch (error) {
    console.error("CUSTOMER PRODUCTS ERROR:", error);

    res.status(500).json({
      message: "Unable to load products.",
    });
  }
});


/* =========================
   ADMIN CUSTOMER REVIEWS
========================= */

// GET ALL REVIEWS
router.get("/reviews", async (req, res) => {
  try {
    const [reviews] = await db.execute(
      `SELECT
         r.review_id,
         r.customer_id,
         r.product_id,
         r.order_id,
         r.rating,
         r.comment,
         r.status,
         r.created_at,
         c.full_name AS customer_name,
         p.name AS product_name
       FROM reviews r
       JOIN customers c ON c.customer_id = r.customer_id
       JOIN products p ON p.product_id = r.product_id
       ORDER BY
         CASE WHEN r.status = 'PENDING' THEN 0 ELSE 1 END,
         r.created_at DESC`
    );

    res.json({ reviews });
  } catch (error) {
    console.error("ADMIN GET REVIEWS ERROR:", error);
    res.status(500).json({
      message: "Unable to load reviews."
    });
  }
});

// APPROVE OR REJECT A REVIEW
router.put("/reviews/:reviewId/status", async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { status } = req.body;

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({
        message: "Status must be APPROVED or REJECTED."
      });
    }

    const [result] = await db.execute(
      `UPDATE reviews
       SET status = ?
       WHERE review_id = ?`,
      [status, reviewId]
    );

    if (result.affectedRows === 0) {
      // Check whether the review exists, even if its status was unchanged.
      const [existing] = await db.execute(
        "SELECT review_id FROM reviews WHERE review_id = ?",
        [reviewId]
      );

      if (existing.length === 0) {
        return res.status(404).json({
          message: "Review not found."
        });
      }
    }

    res.json({
      message: `Review ${status.toLowerCase()} successfully.`,
      status
    });
  } catch (error) {
    console.error("ADMIN UPDATE REVIEW ERROR:", error);
    res.status(500).json({
      message: "Unable to update review status."
    });
  }
});


module.exports = router;