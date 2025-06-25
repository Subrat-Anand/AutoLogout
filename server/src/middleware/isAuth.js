const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const isAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "Unauthorized - Token missing" });

    const decoded = jwt.verify(token, process.env.SECRET);
    const user = await User.findById(decoded.id);

    // ✅ Check if token in DB matches the cookie token
    if (!user || user.token !== token) {
      return res.status(401).json({ message: "Session expired or logged in elsewhere" });
    }

    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized - Invalid token" });
  }
};

module.exports = isAuth;
