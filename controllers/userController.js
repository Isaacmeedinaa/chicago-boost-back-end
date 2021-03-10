const _ = require("lodash");
const bcrypt = require("bcrypt");
const randomize = require("randomatic");
const client = require("twilio")(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const { User, userValidator } = require("../models/User");
const { RecoveryCode } = require("../models/RecoveryCode");

const userController = {
  getUsers: async (req, res) => {
    if (!req.user.admin)
      return res.status(401).send({ message: "Unathorized!" });

    const users = await User.find().select("-__v -password");
    return res.status(200).send(users);
  },
  getUser: async (req, res) => {
    try {
      const user = await User.findById(req.params.id).select("-__v -password");

      if (!user) return res.status(404).send({ error: "User was not found!" });

      return res.status(200).send(user);
    } catch {
      return res.status(404).send({ error: err });
    }
  },
  registerUser: async (req, res) => {
    const { error } = userValidator(req.body, req.language);
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
    let emailTakenMsg;
    if (req.language === "en-US" || req.language === "en") {
      emailTakenMsg = "Email is taken!";
    } else if (req.language === "es-US" || req.language === "es") {
      emailTakenMsg = "¡El correo electrónico está tomado!";
    }
    if (user)
      return res.status(400).send({ field: "email", message: emailTakenMsg });

    user = await User.findOne({ phoneNumber: req.body.phoneNumber });
    let phoneNumberTakenMsg;
    if (req.language === "en-US" || req.language === "en") {
      phoneNumberTakenMsg = "Phone number is taken!";
    } else if (req.language === "es-US" || req.language === "es") {
      phoneNumberTakenMsg = "¡El número de teléfono está tomado!";
    }
    if (user)
      return res
        .status(400)
        .send({ field: "phoneNumber", message: phoneNumberTakenMsg });

    user = await User.findOne({ email: req.body.pushToken });
    if (user)
      return res
        .status(400)
        .send({ field: "pushToken", message: "Push token is taken!" });

    let userArray = req.body.pushToken
      ? [
          "firstName",
          "lastName",
          "email",
          "phoneNumber",
          "password",
          "pushToken",
          "admin",
        ]
      : ["firstName", "lastName", "email", "phoneNumber", "password", "admin"];

    user = new User(_.pick(req.body, userArray));

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    user = await user.save();

    user = await User.findById(user._id).select("-__v -password");

    const token = user.generateAuthToken();

    const resObj = {
      user: user,
      token: token,
    };

    return res.status(200).send(resObj);
  },
  updateUser: async (req, res) => {
    let userPassword = await User.findById(req.params.id).select("password");

    if (!userPassword)
      return res.status(404).send({ message: "User was not found!" });

    let user = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
      password: userPassword.password,
      pushToken: req.body.pushToken,
      admin: req.body.admin,
    };

    const userEmail = await User.findOne({ email: req.body.email });
    let emailTakenMsg;
    if (req.language === "en-US" || req.language === "en") {
      emailTakenMsg = "Email is taken!";
    } else if (req.language === "es-US" || req.language === "es") {
      emailTakenMsg = "¡El correo electrónico está tomado!";
    }
    if (userEmail && userEmail._id.toString() !== req.params.id)
      return res.status(401).send({ field: "email", message: emailTakenMsg });

    const userPhoneNumber = await User.findOne({
      phoneNumber: req.body.phoneNumber,
    });
    let phoneNumberTakenMsg;
    if (req.language === "en-US" || req.language === "en") {
      phoneNumberTakenMsg = "Phone number is taken!";
    } else if (req.language === "es-US" || req.language === "es") {
      phoneNumberTakenMsg = "¡El número de teléfono está tomado!";
    }
    if (userPhoneNumber && userPhoneNumber._id.toString() !== req.params.id)
      return res
        .status(401)
        .send({ field: "phoneNumber", message: phoneNumberTakenMsg });

    const { error } = userValidator(user, req.language);
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
          admin: req.body.admin,
        },
        {
          new: true,
        }
      ).select("-__v -password");

      if (!user) return res.status(404).send({ error: "User was not found!" });

      return res.status(200).send(user);
    } catch (err) {
      return res.status(404).send({ error: err });
    }
  },
  generateRecoveryCode: async (req, res) => {
    const user = await User.findOne({ phoneNumber: req.body.phoneNumber });
    let phoneNumberExistsMsg;
    if (req.language === "en-US" || req.language === "en") {
      phoneNumberExistsMsg = "Phone number does not exist!";
    } else if (req.language === "es-US" || req.language === "es") {
      phoneNumberExistsMsg = "¡El número de teléfono no existe!";
    }
    if (!user)
      return res.status(404).send({
        field: "phoneNumber",
        message: phoneNumberExistsMsg,
      });

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
        to: `+${user.phoneNumber}`,
      })
      .then((message) => {
        if (message.status === "accepted")
          return res.status(200).send({
            phoneNumber: user.phoneNumber,
            recoveryCode: recoveryCode,
          });
      })
      .done();
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
      let validPasswordMsg;
      if (req.language === "en-US" || req.language === "en") {
        validPasswordMsg = "Password is incorrect!";
      } else if (req.language === "es-US" || req.language === "es") {
        validPasswordMsg = "¡La contraseña es incorrecta!";
      }
      if (!validPassword)
        return res.status(401).send({
          field: "currentPassword",
          message: validPasswordMsg,
        });

      const { error } = userValidator(
        { password: req.body.newPassword },
        req.language
      );
      if (error.details.some((error) => error.path[0] === "password")) {
        const errorsArray = error.details.map((error) => {
          let errorObj = {};
          errorObj.field = error.path[0];
          errorObj.message = error.message;
          return errorObj;
        });
        return res.status(400).send({ validationErrors: errorsArray });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.newPassword, salt);

      user = await user.save();
      user = await User.findById(user._id).select("-__v -password");

      return res.status(200).send(user);
    } else if (
      req.params.id === "null" &&
      req.body.recoveryCode &&
      req.body.newPassword
    ) {
      let recoveryCode = await RecoveryCode.findOne({
        code: req.body.recoveryCode,
      }).populate("user");
      let validRecoveryCodeMsg;
      if (req.language === "en-US" || req.language === "en") {
        validRecoveryCodeMsg = "Recovery code is invalid!";
      } else if (req.language === "es-US" || req.language === "es") {
        validRecoveryCodeMsg = "¡El código de recuperación no es válido!";
      }
      if (!recoveryCode)
        return res.status(404).send({
          field: "recoveryCode",
          message: validRecoveryCodeMsg,
        });

      let user = await User.findById(recoveryCode.user._id);

      const { error } = userValidator(
        { password: req.body.newPassword },
        req.language
      );
      if (error.details.some((error) => error.path[0] === "password")) {
        const errorsArray = error.details.map((error) => {
          let errorObj = {};
          errorObj.field = error.path[0];
          errorObj.message = error.message;
          return errorObj;
        });
        return res.status(400).send({ validationErrors: errorsArray });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.newPassword, salt);

      user = await user.save();
      user = await User.findById(user._id).select("-__v -password");

      recoveryCode = await RecoveryCode.findByIdAndDelete(recoveryCode._id);

      return res.status(200).send(user);
    } else {
      let providedPasswordRecoveryCodeMsg;
      if (req.language === "en-US" || req.language === "en") {
        providedPasswordRecoveryCodeMsg =
          "Password or recovery code were not provided.";
      } else if (req.language === "es-US" || req.language === "es") {
        providedPasswordRecoveryCodeMsg =
          "No se proporcionó la contraseña ni el código de recuperación.";
      }
      return res.status(401).send({ message: providedPasswordRecoveryCodeMsg });
    }
  },
  sendContactEmail: async (req, res) => {
    let user;

    user = await User.findOne({ email: req.body.email });
    let emailExistsMsg;
    if (req.language === "en-US" || req.language === "en") {
      emailExistsMsg = "Email does not exist!";
    } else if (req.language === "es-US" || req.language === "es") {
      emailExistsMsg = "¡El correo electrónico no existe!";
    }
    if (!user)
      return res.status(404).send({ field: "email", message: emailExistsMsg });

    user = await User.findOne({ phoneNumber: req.body.phoneNumber });
    let phoneNumberExistsMsg;
    if (req.language === "en-US" || req.language === "en") {
      phoneNumberExistsMsg = "Phone number does not exist!";
    } else if (req.language === "es-US" || req.language === "es") {
      phoneNumberExistsMsg = "¡El número de teléfono no existe!";
    }
    if (!user)
      return res.status(404).send({
        field: "phoneNumber",
        message: phoneNumberExistsMsg,
      });

    const emailMsg = {
      to: "isaac.meedinaa@gmail.com",
      from: req.body.email,
      subject: "Chicago Boost App Contact Form",
      html: `<strong>${req.body.message}</strong>`,
    };

    let textMsg;
    if (req.language === "en-US" || req.language === "en") {
      textMsg =
        "Your contact email was successfully sent. Please wait 1-3 days for a response.";
    } else if (req.language === "es-US" || req.language === "es") {
      textMsg =
        "Su correo electrónico de contacto se envió correctamente. Espere de 1 a 3 días para recibir una respuesta.";
    }

    sgMail
      .send(emailMsg)
      .then(() => {
        client.messages
          .create({
            body: textMsg,
            messagingServiceSid: "MG8d321409bf416cf4cacb714821e0220c",
            to: `+${req.body.phoneNumber}`,
          })
          .then((message) => {
            if (message.status === "accepted")
              return res.status(200).send({ successMessage: "Email sent!" });
          })
          .done();
      })
      .catch((err) => {
        console.log(err);
      });
  },
};

module.exports = userController;
