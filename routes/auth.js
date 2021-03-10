const express = require("express");
const userJwtMiddleware = require("../middleware/userJwtMiddleware");
const languageMiddleware = require("../middleware/languageMiddleware");
const authController = require("../controllers/authController");

const router = express.Router();

router.post("/user-login", [languageMiddleware], authController.userLogin);
router.get(
  "/auto-user-login",
  [userJwtMiddleware],
  authController.autoUserLogin
);

module.exports = router;
