require("dotenv").config();
const jsonwebtoken = require("jsonwebtoken");
const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const passwordComplexity = require("joi-password-complexity");
const {
  enUserValidations,
  esUserValidations,
} = require("../validations/userValidations");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, min: 1, required: true },
    lastName: { type: String, min: 1, required: true },
    email: { type: String, min: 1, max: 255, unique: true, required: true },
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

const userValidator = (user, language) => {
  let validationMessages;

  if (language === "en-US" || language === "en") {
    validationMessages = enUserValidations;
  } else if (language === "es-US" || language === "es") {
    validationMessages = esUserValidations;
  }

  const schema = Joi.object({
    firstName: Joi.string()
      .min(1)
      .required()
      .messages(validationMessages.firstName),
    lastName: Joi.string()
      .min(1)
      .required()
      .messages(validationMessages.lastName),
    email: Joi.string()
      .min(1)
      .max(255)
      .email()
      .required()
      .messages(validationMessages.email),
    phoneNumber: Joi.string()
      .min(11)
      .max(11)
      .required()
      .messages(validationMessages.phoneNumber),
    password: passwordComplexity(passwordComplexityOptions)
      .required()
      .messages(validationMessages.password),
    pushToken: Joi.string().min(1).messages(validationMessages.pushToken),
    admin: Joi.boolean().required(),
  }).options({ abortEarly: false });

  return schema.validate(user, joiObjOptions);
};

exports.userSchema = userSchema;
exports.User = User;
exports.userValidator = userValidator;
