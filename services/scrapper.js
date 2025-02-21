const cron = require("node-cron");
const Product = require("../models/product");
const FirecrawlApp = require("@mendable/firecrawl-js").default;
const { urls, prompt } = require("../config/websites");
require('dotenv').config();
const { z } = require("zod");

const firecrawlApp = new FirecrawlApp({
  apiKey: process.env.FIRECRAWL_API_KEY,
});

const schema = z.object({
  productName: z.string(),
  currentPrice: z.number(),
  originalPrice: z.number(),
  discount: z.string(),
  stockStatus: z.string(),
  promotionalOffer: z.string(),
  website: z.string(),
  url: z.string(),
});

class ScraperService {
  constructor() {
    this.scrapeWebsite = this.scrapeWebsite.bind(this);
    this.startScheduledScraping = this.startScheduledScraping.bind(this);
  }

  async scrapeWebsite() {
    try {
      const scrapeResult = await firecrawlApp.extract(
        urls,
        {
          prompt : prompt,
          schema: schema
        }
      );

      if (!scrapeResult.success) {
        throw new Error(`Extraction failed: ${scrapeResult.error}`);
      }

      const items = scrapeResult.data.products;
      const currentTimestamp = new Date();

      for (const item of items) {
        const formattedItem = {
          productName: item.name,
          currentPrice: item.price,
          originalPrice: item.originalPrice || item.price,
          discount: item.discount || "0%",
          stockStatus: item.stockStatus || "Unknown",
          promotionalOffer: item.promotionalOffer || null,
          website: item.website,
          url: item.url,
          timestamp: currentTimestamp,
        };

        await Product.findOneAndUpdate(
          { productName: formattedItem.productName, website: formattedItem.website },
          formattedItem,
          { upsert: true, new: true }
        );
      }

      console.log(`Successfully updated ${items.length} products`);
    } catch (error) {
      console.error("Error scraping websites:", error);
      throw error;
    }
  }

  startScheduledScraping() {
    cron.schedule("0 */6 * * *", async () => {
      console.log("Running scheduled scraping service...");
      try {
        await this.scrapeWebsite();
      } catch (error) {
        console.error("Error during scheduled scraping:", error);
      }
    });
  }
}

module.exports = ScraperService;