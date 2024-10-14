const express = require("express");
const {
  handleGenerateNewShortUrl,
  handleGetAnalytics,
} = require("../controller/url");
const router = express.Router();

// POST route for generating a new short URL
router.post("/", handleGenerateNewShortUrl);

// GET route for fetching analytics, with consistent parameter naming
router.get("/analytics/:shortID", handleGetAnalytics);

module.exports = router;
