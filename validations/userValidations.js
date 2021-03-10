const enUserValidations = {
  firstName: {
    "string.base": "First name should be a string.",
    "string.empty": "First name cannot be empty.",
    "any.required": "First name is required.",
    "string.min": "First name should at least be 1 characters long.",
  },
  lastName: {
    "string.base": "Last name should be a string.",
    "string.empty": "Last name cannot be empty.",
    "any.required": "Last name is required.",
    "string.min": "Last name should at least be 1 characters long.",
  },
  email: {
    "string.base": "Email should be a string.",
    "string.min": "Email should at least be 1 characters long.",
    "string.max": "Email should not be over 255 characters long.",
    "string.email": "Email must be a valid email.",
    "any.required": "Email is required.",
  },
  phoneNumber: {
    "string.base": "Phone number should be a string.",
    "string.empty": "Phone number cannot be empty.",
    "any.required": "Phone number is required.",
    "string.min": "Phone number should at least be 11 characters long.",
    "string.max": "Phone number should not be over 11 characters long.",
  },
  password: {
    "any.required": "Password is required.",
  },
  pushToken: {
    "string.base": "Push token should be a string.",
    "string.min": "Push token should at least be 1 characters long.",
  },
};

const esUserValidations = {
  firstName: {
    "string.base": "First name should be a string.",
    "string.empty": "First name cannot be empty.",
    "any.required": "First name is required.",
    "string.min": "El primero nombre debe tener al menos 1 carácter.",
  },
  lastName: {
    "string.base": "Last name should be a string.",
    "string.empty": "Last name cannot be empty.",
    "any.required": "Last name is required.",
    "string.min": "El apellido debe tener al menos 1 carácter.",
  },
  email: {
    "string.base": "Email should be a string.",
    "string.min": "El correo electrónico debe tener al menos 1 carácter.",
    "string.max": "El correo electrónico no debe tener más de 255 caracteres.",
    "string.email": "El correo electrónico debe ser válido.",
    "any.required": "Email is required.",
  },
  phoneNumber: {
    "string.base": "Phone number should be a string.",
    "string.empty": "Phone number cannot be empty.",
    "any.required": "Phone number is required.",
    "string.min": "El número de teléfono debe tener al menos 11 caracteres.",
    "string.max": "El número de teléfono no debe tener más de 11 caracteres.",
  },
  password: {
    "any.required": "Password is required.",
  },
  pushToken: {
    "string.base": "Push token should be a string.",
    "string.min": "Push token should at least be 1 characters long.",
  },
};

exports.enUserValidations = enUserValidations;
exports.esUserValidations = esUserValidations;
