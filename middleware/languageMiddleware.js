const languageMiddleware = (req, res, next) => {
  const language = req.header("x-user-language");
  if (!language)
    return res
      .status(401)
      .send({ message: "Access denied. Please provide the user language." });

  req.language = language;
  next();
};

module.exports = languageMiddleware;
