const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const {
  enRecoveryCodeValidations,
  esRecoveryCodeValidations,
} = require("../validations/recoveryCodeValidations");

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

const recoveryCodeValidator = (recoveryCode, language) => {
  let validationMessages;

  if (language === "en-US" || language === "en") {
    validationMessages = enRecoveryCodeValidations;
  } else if (language === "es-US" || language === "es") {
    validationMessages = esRecoveryCodeValidations;
  }

  const schema = Joi.object({
    code: Joi.string()
      .min(6)
      .max(6)
      .required()
      .messages(validationMessages.code),
    user: Joi.objectId().required().messages(validationMessages.user),
  }).options({ abortEarly: false });

  return schema.validate(recoveryCode, joiObjOptions);
};

exports.recoveryCodeSchema = recoveryCodeSchema;
exports.RecoveryCode = RecoveryCode;
exports.recoveryCodeValidator = recoveryCodeValidator;
