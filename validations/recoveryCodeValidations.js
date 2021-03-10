const enRecoveryCodeValidations = {
  code: {
    "any.required": "Code is required",
    "string.min": "Recovery code should be 6 characters.",
    "string.max": "Recovery code should be 6 characters.",
    "string.empty": "Recovery code must not be empty.",
    "string.base": "Phone number should be a string.",
  },
  user: {
    "any.required": "User is required.",
  },
};

const esRecoveryCodeValidations = {
  code: {
    "any.required": "Code is required",
    "string.min": "El código de recuperación debe tener 6 caracteres.",
    "string.max": "El código de recuperación debe tener 6 caracteres.",
    "string.empty": "Recovery code must not be empty.",
    "string.base": "Phone number should be a string.",
  },
  user: {
    "any.required": "User is required.",
  },
};

exports.enRecoveryCodeValidations = enRecoveryCodeValidations;
exports.esRecoveryCodeValidations = esRecoveryCodeValidations;
