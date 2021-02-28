const bcrypt = require("bcrypt");
const { User } = require("../models/User");

const authController = {
  userLogin: async (req, res) => {
    let user = await User.findOne({ phoneNumber: req.body.phoneNumber });
    if (!user)
      return res
        .status(401)
        .send({ message: "Invalid phone number or password!" });

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword)
      return res
        .status(401)
        .send({ message: "Invalid phone number or password!" });

    user = await User.findById(user._id).select("-__v -password -pushToken");

    const token = user.generateAuthToken();

    const resObj = {
      user: user,
      token: token,
    };

    return res.status(200).send(resObj);
  },
  autoUserLogin: async (req, res) => {
    try {
      const user = await User.findById(req.user._id).select(
        "-__v -password -pushToken"
      );

      if (!user)
        return res.status(400).send({ message: "User was not found." });

      return res.status(200).send(user);
    } catch (err) {
      return res.status(400).send({ message: err });
    }
  },
};

module.exports = authController;
