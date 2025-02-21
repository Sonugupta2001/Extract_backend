const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  currentPrice: Number,
  originalPrice: Number,
  discount: String,
  stockStatus: String,
  promotionalOffer: String,
  website: { type: String, required: true },
  url: String,
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Product || mongoose.model("Product", productSchema);