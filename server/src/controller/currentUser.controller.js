const User = require('../models/user.model')


const getCurrentUser = async (req, res) => {
    try {
        const userId = req.userId; // Make sure req.userId is set by isAuth middleware
        const user = await User.findById(userId).select("-password");

        if (!user) {
            return res.status(400).json({
                message: "User not found"
            });
        }

        return res.status(200).json(user);  // ✅ fixed typo here
    } catch (err) {
        return res.status(500).json({
            message: `Current user error: ${err}`
        });
    }
};

module.exports = getCurrentUser