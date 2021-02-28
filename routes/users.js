const express = require("express");

const router = express.Router();

const jwtMiddleware = require("../middleware/jwtMiddleware");
const userController = require("../controllers/userController");

router.get("/", [jwtMiddleware], userController.getUsers);
router.get("/:id", [jwtMiddleware], userController.getUser);
router.post("/register", userController.registerUser);
router.put("/:id", [jwtMiddleware], userController.updateUser);
router.post("/recoverycode", userController.generateRecoveryCode);
router.put(
  "/updatepassword/:id",
  [jwtMiddleware],
  userController.updateUserPassword
);

module.exports = router;
