const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

let io;

const setupSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "https://autologout-frontend.onrender.com", // apne frontend ka URL
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Token not provided"));

    try {
      const decoded = jwt.verify(token, process.env.SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      return next(new Error("Invalid token"));
    }
  });

  io.on("connection", async (socket) => {
    const userId = socket.userId;
    const socketId = socket.id;

    try {
      const user = await User.findById(userId);
      if (!user) return;

      // Delay to allow previous socket to disconnect (useful on refresh)
      setTimeout(async () => {
        const sockets = await io.fetchSockets();
        const isOldConnected = sockets.some(s => s.id === user.socketId);

        if (user.socketId && user.socketId !== socketId && isOldConnected) {
          io.to(user.socketId).emit("forceLogout", "Someone logged into your ID");
          user.token = null; // optional: clear token
        }

        user.socketId = socketId;
        await user.save();
      }, 500); // 0.5 second delay

      socket.on("disconnect", async () => {
        const user = await User.findById(userId);
        if (user && user.socketId === socketId) {
          user.socketId = null;
          await user.save();
        }
      });

    } catch (err) {
      console.error("Socket connection error:", err.message);
    }
  });
};

const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};

module.exports = { setupSocket, getIO };
