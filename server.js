const express = require("express");
const cors = require("cors");
const ScraperService = require("./services/scrapper");
const productController = require("./controllers/productControllers");
const db = require("./config/db");
const bodyParser = require("body-parser")

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));


db.connect()
  .then(() => {
    const scraperService = new ScraperService();
    scraperService.startScheduledScraping();

    app.use("/api", productController);

    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to DB", err);
  });