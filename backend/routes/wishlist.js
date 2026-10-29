const express = require("express");
const db = require("../db");

const router = express.Router();

// ADD TO WISHLIST
router.post("/", async (req, res) => {
  try {
    const { customerId, productId } = req.body;

    if (!customerId || !productId) {
      return res.status(400).json({
        message: "Customer and product are required.",
      });
    }

    await db.execute(
      `INSERT INTO wishlist (customer_id, product_id)
       VALUES (?, ?)`,
      [customerId, productId]
    );

    res.status(201).json({
      message: "Added to wishlist.",
    });

  } catch (error) {

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "Product already in wishlist.",
      });
    }

    console.error("ADD WISHLIST ERROR:", error);

    res.status(500).json({
      message: "Unable to add to wishlist.",
    });
  }
});

// GET CUSTOMER WISHLIST
router.get("/:customerId", async (req, res) => {
  try {
    const { customerId } = req.params;

    const [items] = await db.execute(
      `SELECT
        w.wishlist_id,
        p.product_id,
        p.name,
        p.description,
        p.price,
        p.stock,
        p.type,
        p.discount,
        p.image_url,
        p.active
       FROM wishlist w
       INNER JOIN products p
         ON w.product_id = p.product_id
       WHERE w.customer_id = ?
       ORDER BY w.created_at DESC`,
      [customerId]
    );

    res.json({
      wishlist: items,
    });

  } catch (error) {
    console.error("GET WISHLIST ERROR:", error);

    res.status(500).json({
      message: "Unable to load wishlist.",
    });
  }
});

// REMOVE FROM WISHLIST
router.delete("/:wishlistId", async (req, res) => {
  try {
    const { wishlistId } = req.params;

    await db.execute(
      `DELETE FROM wishlist
       WHERE wishlist_id = ?`,
      [wishlistId]
    );

    res.json({
      message: "Removed from wishlist.",
    });

  } catch (error) {
    console.error("REMOVE WISHLIST ERROR:", error);

    res.status(500).json({
      message: "Unable to remove wishlist item.",
    });
  }
});

module.exports = router;