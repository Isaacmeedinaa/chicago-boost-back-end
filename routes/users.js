const express = require("express");
const userJwtMiddleware = require("../middleware/userJwtMiddleware");
const languageMiddleware = require("../middleware/languageMiddleware");
const userController = require("../controllers/userController");

const router = express.Router();

router.get("/", [userJwtMiddleware], userController.getUsers);
router.get("/:id", [userJwtMiddleware], userController.getUser);
router.post("/register", [languageMiddleware], userController.registerUser);
router.put(
  "/:id",
  [userJwtMiddleware, languageMiddleware],
  userController.updateUser
);
router.post(
  "/recovery-code",
  [languageMiddleware],
  userController.generateRecoveryCode
);
router.put(
  "/update-password/:id",
  [userJwtMiddleware, languageMiddleware],
  userController.updateUserPassword
);
router.post(
  "/send-contact-email",
  [userJwtMiddleware, languageMiddleware],
  userController.sendContactEmail
);

module.exports = router;
