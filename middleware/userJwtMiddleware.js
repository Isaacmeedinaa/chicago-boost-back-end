require("dotenv").config();
const jsonwebtoken = require("jsonwebtoken");

const userJwtMiddleware = (req, res, next) => {
  if (req.params.id === "null") {
    next();
    return;
  }
  const token = req.header("x-auth-token");
  if (!token)
    return res
      .status(401)
      .send({ message: "Access denied. No token provided." });

  try {
    const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).send({ message: "Invalid token." });
  }
};

module.exports = userJwtMiddleware;
