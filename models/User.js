require("dotenv").config();
const jsonwebtoken = require("jsonwebtoken");
const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const passwordComplexity = require("joi-password-complexity");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, min: 1, required: true },
    lastName: { type: String, min: 1, required: true },
    email: { type: String, min: 1, max: 255, unique: true, required: false },
    phoneNumber: {
      type: String,
      min: 11,
      max: 11,
      unique: true,
      required: true,
    },
    password: { type: String, min: 1, required: true },
    pushToken: {
      type: String,
      min: 1,
      unique: true,
      required: false,
      index: true,
      sparse: true,
    },
    admin: { type: Boolean, required: true },
  },
  { timestamps: true }
);

userSchema.methods.generateAuthToken = function () {
  const token = jsonwebtoken.sign(
    { _id: this._id, admin: this.admin },
    process.env.JWT_SECRET
  );
  return token;
};

const User = mongoose.model("User", userSchema);

const joiObjOptions = {
  errors: {
    wrap: {
      label: "",
    },
  },
};

const passwordComplexityOptions = {
  min: 6,
  max: 1024,
  lowerCase: 1,
  upperCase: 1,
  numeric: 1,
  symbol: 1,
  requirementCount: 6,
};

const userValidator = (user) => {
  const schema = Joi.object({
    firstName: Joi.string().min(1).required().messages({
      "string.base": "First name should be a string.",
      "string.empty": "First name cannot be empty.",
      "any.required": "First name is required.",
      "string.min": "First name should at least be 1 characters long.",
    }),
    lastName: Joi.string().min(1).required().messages({
      "string.base": "Last name should be a string.",
      "string.empty": "Last name cannot be empty.",
      "any.required": "Last name is required.",
      "string.min": "Last name should at least be 1 characters long.",
    }),
    email: Joi.string().min(1).max(255).email().messages({
      "string.base": "Email should be a string.",
      "string.min": "Email should at least be 1 characters long.",
      "string.max": "Email should not be over 255 characters long.",
      "string.email": "Email must be a valid email.",
    }),
    phoneNumber: Joi.string().min(11).max(11).required().messages({
      "string.base": "Phone number should be a string.",
      "string.empty": "Phone number cannot be empty.",
      "any.required": "Phone number is required.",
      "string.min": "Phone number should at least be 11 characters long.",
      "string.max": "Phone number should not be over 11 characters long.",
    }),
    password: passwordComplexity(passwordComplexityOptions)
      .required()
      .messages({
        "any.required": "Password is required.",
      }),
    pushToken: Joi.string().min(1).messages({
      "string.base": "Push token should be a string.",
      "string.min": "Push token should at least be 1 characters long.",
    }),
    admin: Joi.boolean().required(),
  }).options({ abortEarly: false });

  return schema.validate(user, joiObjOptions);
};

exports.userSchema = userSchema;
exports.User = User;
exports.userValidator = userValidator;
