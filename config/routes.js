const express = require("express");

const auth = require("../routes/auth");
const users = require("../routes/users");
const locations = require("../routes/locations");
const deals = require("../routes/deals");

const routes = (app) => {
  app.use(express.json());

  app.use("/api/v1/auth", auth);
  app.use("/api/v1/users", users);
  app.use("/api/v1/locations", locations);
  app.use("/api/v1/deals", deals);
};

module.exports = routes;
