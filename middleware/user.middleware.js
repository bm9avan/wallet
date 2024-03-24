const jwt = require("jsonwebtoken");

exports.currentUser = (req, res, next) => {
  const token = req.header("Authorization");
  if (token?.startsWith("Bearer ")) {
    try {
      const user = jwt.verify(
        token.replace("Bearer ", ""),
        process.env.JWT_SECRET
      );
      req.user = user;
      return next();
    } catch (error) {
      return res.status(500).json({ error: "Error while decodeing Token" });
    }
  } else {
    return res.status(401).json({ error: "Token not found" });
  }
};
