const _ = require("lodash");
const bcrypt = require("bcrypt");
const randomize = require("randomatic");
const client = require("twilio")(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const { User, userValidator } = require("../models/User");
const { RecoveryCode } = require("../models/RecoveryCode");

const userController = {
  getUsers: async (req, res) => {
    const users = await User.find().select("-__v -password -pushToken");
    return res.status(200).send(users);
  },
  getUser: async (req, res) => {
    try {
      const user = await User.findById(req.params.id).select(
        "-__v -password -pushToken"
      );

      if (!user) return res.status(404).send({ error: "User was not found!" });

      return res.status(200).send(user);
    } catch {
      return res.status(404).send({ error: err });
    }
  },
  registerUser: async (req, res) => {
    const { error } = userValidator(req.body);
    if (error) {
      const errorsArray = error.details.map((error) => {
        let errorObj = {};
        errorObj.field = error.path[0];
        errorObj.message = error.message;
        return errorObj;
      });
      return res.status(400).send({ validationErrors: errorsArray });
    }

    let user;

    user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).send({ message: "Email is taken!" });

    user = await User.findOne({ phoneNumber: req.body.phoneNumber });
    if (user)
      return res.status(400).send({ message: "Phone number is taken!" });

    user = await User.findOne({ email: req.body.pushToken });
    if (user) return res.status(400).send({ message: "Pusk token is taken!" });

    user = new User(
      _.pick(req.body, [
        "firstName",
        "lastName",
        "email",
        "phoneNumber",
        "password",
        "pushToken",
      ])
    );

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    user = await user.save();

    user = await User.findById(user._id).select("-__v -password -pushToken");

    const token = user.generateAuthToken();

    const resObj = {
      user: user,
      token: token,
    };

    return res.status(200).send(resObj);
  },
  updateUser: async (req, res) => {
    let userPassword = await User.findById(req.params.id).select(
      "password -_id"
    );

    if (!userPassword)
      return res.send(404).send({ message: "User not found!" });

    let user = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
      password: userPassword.password,
      pushToken: req.body.pushToken,
    };

    const { error } = userValidator(user);
    if (error) {
      const errorsArray = error.details.map((error) => {
        let errorObj = {};
        errorObj.field = error.path[0];
        errorObj.message = error.message;
        return errorObj;
      });
      return res.status(400).send({ validationErrors: errorsArray });
    }

    try {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        {
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          email: req.body.email,
          phoneNumber: req.body.phoneNumber,
          password: userPassword.password,
          pushToken: req.body.pushToken,
        },
        {
          new: true,
        }
      ).select("-__v -password -pushToken");

      if (!user) return res.status(404).send({ error: "User was not found!" });

      return res.send(user);
    } catch (err) {
      return res.status(404).send({ error: err });
    }
  },
  generateRecoveryCode: async (req, res) => {
    const user = await User.findOne({ phoneNumber: req.body.phoneNumber });
    if (!user)
      return res.status(404).send({ message: "Phone number does not exist!" });

    let code = randomize("0", 6);
    let recoveryCode = await RecoveryCode.findOne({ code: code });

    if (recoveryCode) {
      while (recoveryCode) {
        code = randomize("0", 6);
        recoveryCode = await RecoveryCode.findOne({ code: code });
        if (!recoveryCode) break;
      }
    }

    recoveryCode = new RecoveryCode({ code: code, user: user._id });
    recoveryCode = await recoveryCode.save();

    recoveryCode = await RecoveryCode.findById(recoveryCode._id).select(
      "-__v -_id"
    );

    client.messages
      .create({
        body: `Your recovery code is ${recoveryCode.code}. If you did not request a code, please ignore this message.`,
        messagingServiceSid: "MG8d321409bf416cf4cacb714821e0220c",
        to: `+1${user.phoneNumber}`,
      })
      .then((message) => console.log(message))
      .done();

    return res
      .status(200)
      .send({ phoneNumber: user.phoneNumber, recoveryCode: recoveryCode });
  },
  updateUserPassword: async (req, res) => {
    if (req.body.password && req.body.newPassword) {
      let user = await User.findById(req.params.id);
      if (!user)
        return res.status(404).send({ message: "User was not found!" });

      const validPassword = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (!validPassword)
        return res.status(401).send({ message: "Password is incorrect!" });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.newPassword, salt);

      user = await user.save();
      user = await User.findById(user._id).select("-__v -password -pushToken");

      return res.status(200).send(user);
    } else if (
      req.params.id === "null" &&
      req.body.recoveryCode &&
      req.body.newPassword
    ) {
      const recoveryCode = await RecoveryCode.findOne({
        code: req.body.recoveryCode,
      }).populate("user");
      if (!recoveryCode)
        return res.status(404).send({ message: "Recovery code is invalid!" });

      let user = await User.findById(recoveryCode.user._id);

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.newPassword, salt);

      user = await user.save();
      user = await User.findById(user._id).select("-__v -password -pushToken");

      await recoveryCode.delete();

      return res.status(200).send(user);
    } else {
      return res
        .status(401)
        .send({ message: "Password or recovery code were not provided." });
    }
  },
};

module.exports = userController;
