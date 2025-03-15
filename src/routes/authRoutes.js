const express = require("express");
const { registerUser, loginUser } = require("../controllers/authController");
const router = express.Router();
const redisClient = require("../config/redisClient");
const authMiddleware = require("../middleware/authMiddleware");


router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", authMiddleware, async (req, res) => {
    try {
      const token = req.token;
      if (!token) {
        return res.status(400).json({ message: "No token provided" });
      }
  
      // Add token to Redis with an expiration time matching JWT expiry
      const expiresIn = 7 * 24 * 60 * 60; // 7 days
      await redisClient.setex(`blacklist_${token}`, expiresIn, "blacklisted");
  
      return res.json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  

module.exports = router;
