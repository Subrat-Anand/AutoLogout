const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model"); // path adjust karo

let io;

const setupSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
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
  const user = await User.findById(userId);

  setTimeout(async () => {
    const sockets = await io.fetchSockets();
    const isOldConnected = sockets.some(s => s.id === user.socketId);

    if (user && user.socketId && user.socketId !== socketId && isOldConnected) {
      io.to(user.socketId).emit("forceLogout", "Someone logged into your ID");
      user.token = null;
    }

    user.socketId = socketId;
    await user.save();
  }, 500); // 0.5 sec delay

  socket.on("disconnect", async () => {
    const user = await User.findById(userId);
    if (user && user.socketId === socketId) {
      user.socketId = null;
      await user.save();
    }
  });
});

};

const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};

module.exports = { setupSocket, getIO };
