const mongoose = require("mongoose");
const Joi = require("Joi");
Joi.objectId = require("joi-objectid")(Joi);

const photoSchema = new mongoose.Schema({
  url: { type: String, min: 1, required: true },
  publicId: { type: String, min: 1, required: true },
  deal: { type: mongoose.Schema.Types.ObjectId, ref: "Deal", required: true },
});

const Photo = mongoose.model("Photo", photoSchema);

const joiObjOptions = {
  errors: {
    wrap: {
      label: "",
    },
  },
};

const photoValidator = (photo) => {
  const schema = Joi.object({
    url: Joi.string().min(1).required().messages({
      "string.base": "URL must be a string.",
      "string.empty": "URL cannot be empty.",
      "string.min": "URL should be at least 1 character long.",
      "any.required": "URL is required.",
    }),
    publicId: Joi.string().min(1).required().messages({
      "string.base": "Public ID must be a string.",
      "string.empty": "Public ID cannot be empty.",
      "string.min": "Public ID should be at least 1 character long.",
      "any.required": "Public ID is required.",
    }),
    deal: Joi.objectId().messages({
      "any.required": "Deal is required.",
    }),
  }).options({ abortEarly: false });

  return schema.validate(photo, joiObjOptions);
};

exports.photoSchema = photoSchema;
exports.Photo = Photo;
exports.photoValidator = photoValidator;
