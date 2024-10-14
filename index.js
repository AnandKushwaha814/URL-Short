const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const { connectToMongoose } = require("./connect");
const URL = require("./models/url");
const urlRoute = require("./routes/url");
const staticRouter = require("./routes/staticRouter");
const userRoute = require("./routes/user");
const { restritToLoggedUserOnly, checkAuth } = require("./middleware/auth");
const app = express();

// Connect to  Mongoose
const PORT = 8000;
connectToMongoose("mongodb://localhost:27017/short-url").then(() => {
  console.log("Mongoose Connected");
});

// Set up view engine
app.set("view engine", "ejs");
app.set("views", path.resolve("./views")); // Ensure path is correct

// Middleware
app.use(express.json());
// For parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


// Routes
app.use("/url", restritToLoggedUserOnly, urlRoute);
app.use("/user", userRoute);
app.use("/", checkAuth, staticRouter);

// Redirect based on shortId
app.get("/url/:shortId", async (req, res) => {
  const shortId = req.params.shortId; // Consistent naming
  try {
    const entry = await URL.findOneAndUpdate(
      { shortid: shortId },
      {
        $push: {
          visitHistory: {
            timestamp: Date.now(),
          },
        },
      },
      { new: true } // Return the updated document
    );

    if (entry) {
      res.redirect(entry.redirectURL);
    } else {
      res.status(404).send("URL not found");
    }
  } catch (error) {
    console.error("Error fetching URL:", error);
    res.status(500).send("Server error");
  }
});

// Test route to fetch all URLs
app.get("/test", async (req, res) => {
  try {
    const allUrls = await URL.find({}); // Fetch all URLs from the database
    console.log(allUrls); // Log the URLs after fetching

    return res.render("home", {
      urls: allUrls,
      name: "Anand",
    }); // Render 'home.ejs' with the fetched URLs and name
  } catch (error) {
    console.error("Error fetching URLs:", error);
    return res.status(500).send("Server error"); // Send an error response
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server Started at http://localhost:${PORT}`);
});
