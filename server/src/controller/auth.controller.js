const User = require('../models/user.model')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Redis = require('ioredis');
const { getIO } = require('../socket/socket');
const redisClient = new Redis(); // default localhost:6379

const SignUp = async(req, res)=>{
    try{
        const {userName, email, password} = req.body;
        const allowedFields = ['userName', 'email', 'password'];

        const keys = Object.keys(req.body)
        const isValid = keys.every(key=> allowedFields.includes(key))
        if(!isValid){
            return res.status(400).json({
                message: "Invalid filed in request body"
            })
        }

        const isEmail = await User.findOne({email})
        if(isEmail){
            return res.status(400).send("email already exist")
        }

        if(password.length < 6){
            return res.status(400).json("Password must be more than 6 latters")
        }

        const hashPassword = await bcrypt.hash(password, 10)

        const user = await User({
            userName,
            email,
            token: null,
            socketId: null,
            password: hashPassword
        })

        const token = jwt.sign({ id: user._id }, process.env.SECRET);
        user.token = token

        await user.save()
        res.status(200).json({
            message: 'User registered successfully',
            user
        })
    }
    catch(err){
        console.error('Signup error:', err.message);
        return res.status(500).json({ message: 'Signup failed' });
    }
}

const LogIn = async (req, res) => {
  const io = getIO();
  const { email, password } = req.body;

  try {
    // 1. Check if user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    // 2. Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // 3. Create new JWT
    const token = jwt.sign({ id: user._id }, process.env.SECRET, { expiresIn: "1d" });

    // 4. Check if user already logged in
    const oldToken = await redisClient.get(`user:${user._id}`);
    console.log("oldToken: ", oldToken)
    if (oldToken) {
      const oldSocketId = await redisClient.get(`socket:${user._id}`);
      if (oldSocketId) {
        console.log("oldSocketId: ", oldSocketId)
        // ⏳ Small delay to allow new socket to connect
        setTimeout(() => {
          io.to(oldSocketId).emit("forceLogout", "Someone logged into your ID");
          console.log("⚠️ Force logout emitted to:", oldSocketId);
        }, 100);
      }
    }

    // 5. Save token in Redis (with 1-day expiry)
    await redisClient.set(`user:${user._id}`, token); // 86400 = 1 day in seconds

    // 6. Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: true, // ✅ use true in production with HTTPS
      sameSite: "Strict",
    });

    // 7. (Optional) Save token in DB if you track it
    user.token = token;
    await user.save();

    // 8. Send response
    res.status(200).json({ message: "Login Successful", user });
  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const logout = async (req, res) => {
  try {
    const token =
      req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      res.clearCookie("token");
      return res.status(200).json({ message: "Logged out (no token)" });
    }

    // Manually decode token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.SECRET);
    } catch (err) {
      res.clearCookie("token");
      return res.status(200).json({ message: "Logged out (invalid token)" });
    }

    const userId = decoded.id;

    // ✅ Delete Redis keys manually (no auth middleware)
    const userDel = await redisClient.del(`user:${userId}`);
    const socketDel = await redisClient.del(`socket:${userId}`);

    console.log(`Redis deleted user:${userDel}, socket:${socketDel}`);

    res.clearCookie("token");
    return res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    console.error("Logout error:", err.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};



module.exports = {SignUp, LogIn, logout}
