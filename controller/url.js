const shortid = require("shortid");
const URL = require("../models/url");

async function handleGenerateNewShortUrl(req, res) {
  const body = req.body;
  // Check if the URL is provided
  if (!body.url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    // Generate a short ID using the shortid package
    const shortID = shortid.generate();

    // Create a new entry in the database
    await URL.create({
      shortid: shortID,
      redirectURL: body.url,
      visitHistory: [],
      createdBy: req.user._id,
    });

    // Return the generated short ID
    return res.render("home", { id: shortID });
  } catch (error) {
    console.error("Error generating new short URL:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

async function handleGetAnalytics(req, res) {
  const shortID = req.params.shortID;

  console.log("Requested shortID:", shortID);

  try {
    const result = await URL.findOne({ shortid: shortID });

    if (result) {
      console.log("Analytics for shortID:", shortID, result); // Log the analytics result
      return res.json({
        totalClicks: result.visitHistory.length,
        analytics: result.visitHistory,
      });
    } else {
      return res.status(404).json({ error: "URL not found" });
    }
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
  handleGenerateNewShortUrl,
  handleGetAnalytics,
};
