
const express = require("express");
const multer = require("multer");
const cloudinary = require("../cloudinary");

const router = express.Router();

// Keep uploaded files in memory temporarily.
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Maximum 5 MB
  },
  fileFilter: (req, file, callback) => {
    if (file.mimetype.startsWith("image/")) {
      callback(null, true);
    } else {
      callback(new Error("Only image files are allowed."));
    }
  },
});

// POST /api/upload/product-image
router.post(
  "/product-image",
  require("../middleware/adminAuth"),
  upload.single("image"),
  async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Please select an image to upload.",
      });
    }

    const streamifier = require("streamifier");

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "ams-tools/products",
          resource_type: "image",
        },
        (error, uploadedImage) => {
          if (error) return reject(error);
          resolve(uploadedImage);
        }
      );

      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });

    res.status(201).json({
      message: "Product image uploaded successfully.",
      imageUrl: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error("IMAGE UPLOAD ERROR:", error);

    res.status(500).json({
      message: "Unable to upload image.",
    });
  }
});

module.exports = router;
