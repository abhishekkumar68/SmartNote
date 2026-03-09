const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const { errorHandler } = require("./middleware/errorMiddleware");

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Make uploads folder static
app.use("/uploads", express.static(require("path").join(__dirname, "uploads")));

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/collections", require("./routes/collectionRoutes"));
app.use("/api/resources", require("./routes/resourceRoutes"));
app.use("/api/bookmarks", require("./routes/bookmarkRoutes"));

app.get("/", (req, res) => {
  res.send("SmartNote Backend Running");
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});