const mongoose = require("mongoose");

const db = () => {
  mongoose
    .connect(
      process.env.NODE_ENV
        ? process.env.MONGODB_PRODUCTION_URI
        : "mongodb://localhost/chicago-boost",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true,
      }
    )
    .then(() => console.log("Connected to MongoDB 🚀!"))
    .catch((err) => console.log(err));
};

module.exports = db;
