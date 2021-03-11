require("dotenv").config();
const express = require("express");
const cors = require("cors");
const database = require("./config/database");
const routes = require("./config/routes");
const cloudinary = require("./config/cloudinary");
const path = require("path");
const app = express();

app.use(cors());
routes(app);
database();
cloudinary();

if (process.env.NODE_ENV === "production") {
  // Serve any static files
  app.use(express.static(path.join(__dirname, "client/build")));

  // Handle React routing, return all requests to React app
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client/build", "index.html"));
  });
}

const port = process.env.PORT || 7000;

app.listen(port, () => console.log(`Listenining on port ${port} 🌎!`));
