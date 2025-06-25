const jwt = require("jsonwebtoken");
const redisClient = require("../socket/socket").redisClient; // adjust path as needed

const isAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "Unauthorized - Token missing" });
    }

    const decoded = jwt.verify(token, process.env.SECRET);
    const userId = decoded.id;

    // ✅ Check Redis for stored token
    const storedToken = await redisClient.get(`user:${userId}`);
    if (storedToken !== token) {
      return res.status(401).json({ message: "Session expired or logged in elsewhere" });
    }

    req.userId = userId;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized - Invalid token" });
  }
};

module.exports = isAuth;
