const mongoose = require("mongoose");
const Joi = require("joi");

const dealSchema = new mongoose.Schema({
  title: { type: String, min: 1, max: 60, required: true },
  description: { type: String, min: 1, max: 250, required: true },
  startDate: { type: Date, default: Date.now, required: true },
  endDate: { type: Date, required: true },
  photos: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Photo", required: true },
  ],
  locations: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Location", required: true },
  ],
});

const Deal = mongoose.model("Deal", dealSchema);

const joiObjOptions = {
  errors: {
    wrap: {
      label: "",
    },
  },
};

const dealValidator = (deal) => {
  const schema = Joi.object({
    title: Joi.string().min(1).max(60).required().messages({
      "string.base": "Title must be a string.",
      "string.empty": "Title cannot be empty.",
      "string.min": "Title should be at least 1 character long.",
      "string.max": "Title should not be over 60 characters long.",
      "any.required": "Title is required.",
    }),
    description: Joi.string().min(1).max(250).required().messages({
      "string.base": "Description must be a string.",
      "string.empty": "Description cannot be empty.",
      "string.min": "Description should be at least 1 character long.",
      "string.max": "Description should not be over 250 characters long.",
      "any.required": "Description is required.",
    }),
    startDate: Joi.date().required().messages({
      "date.base": "State date must be a valid date.",
      "any.required": "Start date must be provided.",
    }),
    endDate: Joi.date().required().messages({
      "date.base": "End date must be a valid date.",
      "any.required": "End date must be provided.",
    }),
    photos: Joi.array(),
    locations: Joi.array(),
  }).options({ abortEarly: false });

  return schema.validate(deal, joiObjOptions);
};

exports.dealSchema = dealSchema;
exports.Deal = Deal;
exports.dealValidator = dealValidator;
