const mongoose = require("mongoose");

const SellerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  aadhaarProof: { type: String, required: true }, // S3/Cloudinary URL
  locationProof: { type: String, required: true },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  plan: { type: mongoose.Schema.Types.ObjectId, ref: "Plan", required: true }, // Plan ID
  planExpiryDate: { type: Date, required: true }, // Expiry Date of Plan
});

module.exports = mongoose.model("Seller", SellerSchema);
