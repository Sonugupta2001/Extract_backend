require("dotenv").config();
const express = require("express");
const cors = require("cors");
const FirecrawlApp = require("@mendable/firecrawl-js").default;

const app = express();
const port = process.env.PORT || 3001;


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const firecrawlApp = new FirecrawlApp({
    apiKey: process.env.FIRECRAWL_API_KEY,
});



app.get("/api/extract-custom", async (req, res) => {
    const { url, prompt } = req.query;
    console.log(url, prompt);
    if(!url || !prompt) {
        return res.status(400).json({error : "Please provide a 'url' and a 'prompt' query parameter" });
    }

    try {
        const scrapeResult = await firecrawlApp.extract(
            [url],
            {
                prompt: prompt,
            }
        );

        if (!scrapeResult.success) {
            throw new Error(`Extraction failed: ${scrapeResult.error}`);
        }
        
        console.log(scrapeResult.data);
        res.json(scrapeResult.data);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});



app.get("/api/extract", async (req, res) => {
    const { url } = req.query;
    if (!url) {
        return res.status(400).json({ error: "Please provide a 'url' query parameter" });
    }

    try {
        const scrapeResult = await firecrawlApp.extract(
            [url],
            {
                prompt: "Extract product names, prices, and any available discounts from this page.",
            }
        );

        if (!scrapeResult.success) {
            throw new Error(`Extraction failed: ${scrapeResult.error}`);
        }
        
        console.log(scrapeResult.data);

        const items = scrapeResult.data.products;
        const formattedData = items.map((item) => ({
            productName: item.name || null,
            currentPrice: item.price || null,
            originalPrice: item.originalPrice || item.price || null,
            discount: item.discount || "0%",
            timestamp: new Date().toISOString(),
        }));

        res.json(formattedData);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});



app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});