require("dotenv").config();
const express = require("express");
const cors = require("cors");
const database = require("./config/database");
const routes = require("./config/routes");
const cloudinary = require("./config/cloudinary");

const app = express();

app.use(cors());
database();
cloudinary();
routes(app);

const port = process.env.PORT || 7000;

app.listen(port, () => console.log(`Listenining on port ${port} 🌎!`));
