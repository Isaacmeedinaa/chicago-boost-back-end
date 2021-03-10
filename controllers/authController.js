const bcrypt = require("bcrypt");
const { User } = require("../models/User");

const authController = {
  userLogin: async (req, res) => {
    let invalidLoginCredentialsMsg;
    if (req.language === "en-US" || req.language === "en") {
      invalidLoginCredentialsMsg = "Invalid phone number or password!";
    } else if (req.language === "es-US" || req.language === "es") {
      invalidLoginCredentialsMsg =
        "¡Número de teléfono o contraseña inválidos!";
    }

    let user = await User.findOne({ phoneNumber: req.body.phoneNumber });
    if (!user)
      return res.status(401).send({ message: invalidLoginCredentialsMsg });

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword)
      return res.status(401).send({ message: invalidLoginCredentialsMsg });

    user = await User.findById(user._id).select("-__v -password");

    const token = user.generateAuthToken();

    const resObj = {
      user: user,
      token: token,
    };

    return res.status(200).send(resObj);
  },
  autoUserLogin: async (req, res) => {
    try {
      const user = await User.findById(req.user._id).select("-__v -password");

      if (!user)
        return res.status(400).send({ message: "User was not found." });

      return res.status(200).send(user);
    } catch (err) {
      return res.status(400).send({ message: err });
    }
  },
};

module.exports = authController;
