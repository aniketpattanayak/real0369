const mongoose = require("mongoose");

const PlanSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  renewalPrice: { type: Number, required: true },
  propertiesLimit: { type: Number, required: true },
  duration: { type: Number, required: true }, // in days
});

module.exports = mongoose.model("Plan", PlanSchema);
