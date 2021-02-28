const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

const recoveryCodeSchema = new mongoose.Schema({
  code: { type: String, min: 6, max: 6, unique: true, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

const RecoveryCode = mongoose.model("RecoveryCode", recoveryCodeSchema);

const joiObjOptions = {
  errors: {
    wrap: {
      label: "",
    },
  },
};

const recoveryCodeValidator = (recoveryCode) => {
  const schema = Joi.object({
    code: Joi.string().min(6).max(6).required().messages({
      "any.required": "Code is required",
      "string.min": "Recovery code should be 6 characters.",
      "string.max": "Recovery code should be 6 characters.",
      "string.empty": "Recovery code must not be empty.",
      "string.base": "Phone number should be a string.",
    }),
    user: Joi.objectId().required().messages({
      "any.required": "User is required.",
    }),
  }).options({ abortEarly: false });

  return schema.validate(recoveryCode, joiObjOptions);
};

exports.recoveryCodeSchema = recoveryCodeSchema;
exports.RecoveryCode = RecoveryCode;
exports.recoveryCodeValidator = recoveryCodeValidator;
