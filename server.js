require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

const port = process.env.PORT || 7000;

app.use(cors());

require("./config/routes")(app);
require("./config/database")();
require("./config/cloudinary")();

if (process.env.NODE_ENV === "production") {
  // Serve any static files
  app.use(express.static(path.join(__dirname, "client/build")));

  // Handle React routing, return all requests to React app
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client/build", "index.html"));
  });
}

app.listen(port, () => console.log(`Listenining on port ${port} 🌎!`));
