const express = require("express");
const jwtMiddleware = require("../middleware/jwtMiddleware");
const authController = require("../controllers/authController");

const router = express.Router();

router.post("/login", authController.userLogin);
router.post("/autologin", [jwtMiddleware], authController.autoUserLogin);

module.exports = router;
