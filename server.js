require("dotenv").config();
const express = require("express");
const cors = require("cors");
const database = require("./config/database");
const routes = require("./config/routes");

const app = express();

app.use(cors());
database();
routes(app);

const port = process.env.PORT || 7000;

app.listen(port, () => console.log(`Listenining on port ${port} 🌎!`));
