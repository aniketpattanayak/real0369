const express = require("express");
const Plan = require("../models/Plan");

const router = express.Router();

// Get all plans
router.get("/", async (req, res) => {
  try {
    const plans = await Plan.find();
    res.json(plans);
  } catch (error) {
    console.error("❌ Error fetching plans:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
