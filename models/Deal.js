const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

const dealSchema = new mongoose.Schema({});

const Deal = mongoose.model("Deal", dealSchema);

const joiObjOptions = {
  errors: {
    wrap: {
      label: "",
    },
  },
};

const dealValidator = (sale) => {};

exports.saleSchema = saleSchema;
exports.Sale = Sale;
exports.saleValidator = saleValidator;
