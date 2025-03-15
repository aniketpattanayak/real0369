const express = require("express");
const { addProperty, getProperties, updateProperty, deleteProperty } = require("../controllers/propertyController");
const { protect, sellerAuth } = require("../middlewares/authMiddleware");
const Seller = require("../models/Seller");
const Property = require("../models/Property");

const router = express.Router();

// Seller adds a new property
router.post("/", protect, sellerAuth, async (req, res) => {
  try {
    const { title, price, location } = req.body;

    if (!title || !price || !location) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Get the seller and their plan
    const seller = await Seller.findOne({ userId: req.user._id }).populate("plan");
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    // Check if plan is expired
    if (new Date() > seller.planExpiryDate) {
      return res.status(403).json({ message: "Your plan has expired. Please renew." });
    }

    // Count seller's existing properties
    const propertyCount = await Property.countDocuments({ seller: seller._id });

    // Check if the seller exceeded their property limit
    if (propertyCount >= seller.plan.propertiesLimit) {
      return res.status(400).json({
        message: `Your plan allows only ${seller.plan.propertiesLimit} properties. Upgrade your plan.`,
      });
    }

    // Create a new property
    const newProperty = new Property({
      seller: seller._id,
      title,
      price,
      location,
    });

    await newProperty.save();
    res.status(201).json({ message: "Property added successfully" });

  } catch (error) {
    console.error("❌ Property Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Seller views their properties
router.get("/", protect, sellerAuth, getProperties);

// Seller updates a property
router.put("/:propertyId", protect, sellerAuth, updateProperty);

// Seller deletes a property
router.delete("/:propertyId", protect, sellerAuth, deleteProperty);

module.exports = router;
