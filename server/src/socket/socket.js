const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const Redis = require("ioredis");

const redisClient = new Redis(); // optionally add host/port if needed
let io;

const setupSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.use((socket, next) => {
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

    const redisSocketKey = `socket:${userId}`;
    const oldSocketId = await redisClient.get(redisSocketKey);

    console.log("🧑‍💻 UserID:", userId);
    console.log("🆕 Current Socket ID:", socketId);
    console.log("📦 Old Socket ID from Redis:", oldSocketId);

    // 🛡 Avoid forceLogout if old socket is not active (e.g., just page refresh)
    if (oldSocketId && oldSocketId !== socketId) {
      const sockets = await io.fetchSockets();
      const isOldSocketStillConnected = sockets.some(s => s.id === oldSocketId);

      if (isOldSocketStillConnected) {
        io.to(oldSocketId).emit("forceLogout", "Someone logged into your ID");
        console.log("⚠️ Sent forceLogout to old socket:", oldSocketId);

        // Clean up old Redis data
        await redisClient.del(`user:${userId}`);
        await redisClient.del(`socket:${userId}`);
        console.log(`🧹 Cleared Redis for user:${userId}`);
      }
    }

    // ✅ Save current socket ID in Redis
    await redisClient.set(redisSocketKey, socketId);
    console.log(`✅ Set socket:${userId} = ${socketId}`);

    // Optional: frontend can ping session check
    // socket.on("checkSession", async () => {
    //   const token = await redisClient.get(`user:${userId}`);
    //   if (!token) {
    //     io.to(socket.id).emit("forceLogout", "Session expired or logged in elsewhere");
    //     console.log("🔴 checkSession → token missing → forceLogout sent");
    //   }
    // });

    // 🔌 Handle disconnect
    socket.on("disconnect", async () => {
      const stored = await redisClient.get(redisSocketKey);
      if (stored === socketId) {
        await redisClient.del(redisSocketKey);
        console.log(`🔌 Socket disconnected & removed: socket:${userId}`);
      }
    });
  });
};

const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};

module.exports = {
  setupSocket,
  getIO,
  redisClient,
};
