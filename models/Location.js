const mongoose = require("mongoose");
const Joi = require("joi");

const locationSchema = new mongoose.Schema({
  name: { type: String, min: 1, required: true },
  phoneNumber: { type: String, min: 11, max: 11, required: true },
  facebookLink: { type: String, min: 1 },
  addressLineOne: { type: String, min: 1, required: true },
  addressLineTwo: { type: String },
  city: { type: String, min: 1, required: true },
  state: { type: String, min: 2, max: 2, required: true },
  zipcode: { type: String, min: 5, max: 5, required: true },
  country: { type: String, min: 1, required: true },
});

const Location = mongoose.model("Location", locationSchema);

const joiObjOptions = {
  errors: {
    wrap: {
      label: "",
    },
  },
};

const locationValidator = (location) => {
  const schema = Joi.object({
    name: Joi.string().min(1).required().messages({
      "string.base": "Location name must be a string.",
      "string.empty": "Location name cannot be empty.",
      "string.min": "Location name should be at least 1 character long.",
      "any.required": "Location name is required.",
    }),
    phoneNumber: Joi.string().min(11).max(11).required().messages({
      "string.base": "Phone number must be a string.",
      "string.empty": "Phone number cannot be empty.",
      "string.min": "Phone number should be at least 11 character long.",
      "string.max": "State should not be over 11 characters long.",
      "any.required": "Phone number is required.",
    }),
    facebookLink: Joi.string().min(1).messages({
      "string.base": "Facebook link must be a string.",
      "string.empty": "Facebook link cannot be empty.",
      "string.min": "Facebook link should be at least 1 character long.",
      "any.required": "Facebook link is required.",
    }),
    addressLineOne: Joi.string().min(1).required().messages({
      "string.base": "Address line one name must be a string.",
      "string.empty": "Address line one cannot be empty.",
      "string.min": "Address line one should be at least 1 character long.",
      "any.required": "Address line one is required.",
    }),
    addressLineTwo: Joi.string().optional().allow("").messages({
      "string.base": "Address line two name must be a string.",
      "any.required": "Address line two is required.",
    }),
    city: Joi.string().min(1).required().messages({
      "string.base": "City name must be a string.",
      "string.empty": "City cannot be empty.",
      "string.min": "City should be at least 1 character long.",
      "any.required": "City line one is required.",
    }),
    state: Joi.string().min(2).max(2).required().messages({
      "string.base": "State name must be a string.",
      "string.empty": "State cannot be empty.",
      "string.min": "State should be at least 2 character long.",
      "string.max": "State should not be over 2 characters long.",
      "any.required": "State line one is required.",
    }),
    zipcode: Joi.string().min(5).max(5).required().messages({
      "string.base": "Zip code name must be a string.",
      "string.empty": "Zip code cannot be empty.",
      "string.min": "Zip code should be at least 5 character long.",
      "string.max": "Zip code should not be over 5 characters long.",
      "any.required": "Zip code line one is required.",
    }),
    country: Joi.string().min(1).required().messages({
      "string.base": "Country name must be a string.",
      "string.empty": "Country cannot be empty.",
      "string.min": "Country should be at least 1 character long.",
      "any.required": "Country line one is required.",
    }),
  }).options({ abortEarly: false });

  return schema.validate(location, joiObjOptions);
};

exports.locationSchema = locationSchema;
exports.Location = Location;
exports.locationValidator = locationValidator;
