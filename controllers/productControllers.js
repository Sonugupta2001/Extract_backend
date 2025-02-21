const express = require("express");
const router = express.Router();
const Product = require("../models/product");
const FirecrawlApp = require("@mendable/firecrawl-js").default;
const mongoose = require("mongoose");
require('dotenv').config();

const firecrawlApp = new FirecrawlApp({
  apiKey: process.env.FIRECRAWL_API_KEY,
});

const checkDBConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(500).json({ error: "Database connection not established" });
  }
  next();
};

router.use(checkDBConnection);

router.post("/extract-custom", async (req, res) => {
  const { urls, prompt } = req.body;

  if (!urls || !prompt) {
    return res.status(400).json({ error: "Missing required parameters: urls, prompt" });
  }

  try {
    const scrapeResult = await firecrawlApp.extract(urls, { prompt });
    if (!scrapeResult.success) {
      throw new Error(`Extraction failed: ${scrapeResult.error}`);
    }
    res.json(scrapeResult.data);
  } catch (error) {
    console.error("Error in custom extraction:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/extract", async (req, res) => {
  const { urls } = req.body;
  if (!urls || !Array.isArray(urls) || urls.length === 0) {
    return res.status(400).json({ error: "Please provide valid urls array" });
  }

  try {
    const scrapeResult = await firecrawlApp.extract(urls, {
      prompt:
        "Extract the products across the provided URLs and get the products with best prices, along with their details such as, product name, current price, original price, discount, promotional offers, stock status, website, and URL.",
    });

    if (!scrapeResult.success) {
      throw new Error(`Extraction failed: ${scrapeResult.error}`);
    }

    const productsToInsert = scrapeResult.data.products.map((product) => ({
      ...product,
      timestamp: new Date(),
    }));

    try {
      const products = await Product.insertMany(productsToInsert);
      res.json(products);
    } catch (error) {
      console.error("Error in saving products:", error);
      res.status(500).json({ error: error.message });
    }
  } catch (error) {
    console.error("Error in extraction:", error);
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;