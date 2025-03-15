const express = require("express");
const Seller = require("../models/Seller");
const Plan = require("../models/Plan");
const { verifySeller, approveSeller } = require("../controllers/sellerController");
const authMiddleware = require("../middleware/authMiddleware");
// const { sellerAuth, admin } = require("../middleware/authMiddleware");


const router = express.Router();


// 🟢 Seller verification request (Only logged-in users)
router.post("/verify", authMiddleware, verifySeller);

// 🟢 Admin approves/rejects seller verification
router.put("/:sellerId/approve", authMiddleware, approveSeller); //adimn

// 🟢 Get seller subscription details
router.get("/subscription", authMiddleware, async (req, res) => { //sellerAuth
  try {
    const seller = await Seller.findOne({ userId: req.user._id }).populate("plan");

    if (!seller) {
      return res.status(404).json({ success: false, message: "Seller not found" });
    }

    if (!seller.plan) {
      return res.status(400).json({ success: false, message: "No active plan found" });
    }

    const today = new Date();
    const expiryDate = seller.planExpiryDate ? new Date(seller.planExpiryDate) : null;

    if (!expiryDate || isNaN(expiryDate.getTime())) {
      return res.status(400).json({ success: false, message: "Invalid expiry date" });
    }

    const remainingDays = Math.max(0, Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24)));

    res.status(200).json({
      success: true,
      plan: seller.plan.name,
      propertiesLimit: seller.plan.propertiesLimit,
      renewalPrice: seller.plan.renewalPrice,
      expiryDate: expiryDate.toISOString(),
      remainingDays,
    });

  } catch (error) {
    console.error("❌ Error fetching subscription:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch subscription details" });
  }
});

// 🟢 Seller renews or upgrades their plan
router.put("/upgrade", authMiddleware, async (req, res) => { //sellerAuth
  try {
    const { newPlanId } = req.body;

    if (!newPlanId) {
      return res.status(400).json({ success: false, message: "Plan ID is required" });
    }

    const newPlan = await Plan.findById(newPlanId);
    if (!newPlan) {
      return res.status(400).json({ success: false, message: "Invalid plan selected" });
    }

    const seller = await Seller.findOne({ userId: req.user._id }).populate("plan");
    if (!seller) {
      return res.status(404).json({ success: false, message: "Seller not found" });
    }

    const currentDate = new Date();

    if (seller.plan && seller.plan._id.toString() === newPlanId) {
      // Renewal case
      if (seller.planExpiryDate && new Date(seller.planExpiryDate) > currentDate) {
        seller.planExpiryDate = new Date(seller.planExpiryDate);
      } else {
        seller.planExpiryDate = currentDate;
      }
      seller.planExpiryDate.setDate(seller.planExpiryDate.getDate() + newPlan.duration);
    } else {
      // New plan or upgrade case
      seller.plan = newPlan._id;
      seller.planExpiryDate = currentDate;
      seller.planExpiryDate.setDate(seller.planExpiryDate.getDate() + newPlan.duration);
    }

    await seller.save();

    res.status(200).json({
      success: true,
      message: `Plan ${seller.plan._id.toString() === newPlanId ? "renewed" : "upgraded"} successfully`,
      plan: {
        name: newPlan.name,
        duration: newPlan.duration,
        propertiesLimit: newPlan.propertiesLimit,
        renewalPrice: newPlan.renewalPrice,
      },
      expiryDate: seller.planExpiryDate.toISOString(),
    });

  } catch (error) {
    console.error("❌ Error upgrading plan:", error.message);
    res.status(500).json({ success: false, message: "Failed to upgrade plan" });
  }
});

module.exports = router;
