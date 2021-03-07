const express = require("express");
const userJwtMiddleware = require("../middleware/userJwtMiddleware");
const userController = require("../controllers/userController");

const router = express.Router();

router.get("/", [userJwtMiddleware], userController.getUsers);
router.get("/:id", [userJwtMiddleware], userController.getUser);
router.post("/register", userController.registerUser);
router.put("/:id", [userJwtMiddleware], userController.updateUser);
router.post("/recovery-code", userController.generateRecoveryCode);
router.put(
  "/update-password/:id",
  [userJwtMiddleware],
  userController.updateUserPassword
);
router.post(
  "/send-contact-email",
  [userJwtMiddleware],
  userController.sendContactEmail
);

module.exports = router;
