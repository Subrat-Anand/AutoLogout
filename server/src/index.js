const express = require('express');
const http = require('http'); // 👈 socket.io ke liye
const DBconnect = require('./config/dbConnect');
const cookieParser = require('cookie-parser')
const authRouter = require('./route/auth');
const { setupSocket, redisClient } = require('./socket/socket'); // 👈 apna socket.js
require('dotenv').config();
const cors = require('cors');
const getCurrentUserRouter = require('./route/currenr.user');

const app = express();
const server = http.createServer(app); // 👈 express app ke upar server banao
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser())
app.use(cors({
  origin: "https://autologout-frontend.onrender.com",
  credentials: true
}))


// All routes
app.use('/api/auth', authRouter);
app.use('/api', getCurrentUserRouter)

// Database connect + server start
DBconnect()
  .then(() => {
    console.log("✅ Database connected successfully");

    // Setup socket.io
    setupSocket(server); // 👈 socket setup server ke saath

    // Start the server
    server.listen(PORT, () => {
      console.log(`🚀 App is listening at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ DB connection failed:", err);
  });
