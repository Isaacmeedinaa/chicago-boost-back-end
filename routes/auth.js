const express = require("express");
const userJwtMiddleware = require("../middleware/userJwtMiddleware");
const authController = require("../controllers/authController");

const router = express.Router();

router.post("/user-login", authController.userLogin);
router.post(
  "/auto-user-login",
  [userJwtMiddleware],
  authController.autoUserLogin
);

module.exports = router;
