require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const redisClient = require("./config/redisClient");

// Import Routes
const authRoutes = require("./routes/authRoutes");
const planRoutes = require("./routes/planRoutes");
const sellerRoutes = require("./routes/sellerRoutes"); // ✅ Import sellerRoutes

const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true,
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/sellers", sellerRoutes); // ✅ Now it will work

const PORT = process.env.PORT || 5001;

// Start Server
const startServer = async () => {
  try {
    await connectDB();

    if (!redisClient.status || redisClient.status === "end") {
      await redisClient.connect();
      console.log("✅ Redis Connected Successfully");
    } else {
      console.log("✅ Redis Already Connected");
    }

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

    process.on("SIGINT", async () => {
      console.log("🛑 Shutting down server...");
      if (redisClient.status === "ready") {
        await redisClient.disconnect();
      }
      server.close(() => {
        console.log("✅ Server closed gracefully.");
        process.exit(0);
      });
    });

    process.on("SIGTERM", async () => {
      console.log("🛑 Received SIGTERM. Closing server...");
      if (redisClient.status === "ready") {
        await redisClient.disconnect();
      }
      server.close(() => {
        console.log("✅ Server closed.");
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("❌ Server startup failed:", error);
    process.exit(1);
  }
};

startServer();
