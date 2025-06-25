import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";
import { authUrl, backend } from "../Private/private";
import { setUser } from "../redux/userSlice";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const SocketSetup = () => {
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const socketRef = useRef(null); // store socket persistently

  useEffect(() => {
    if (!user?.token) return;

    console.log("token", user)

    const socket = io(backend, {
      auth: { token: user.token },
    });

    socketRef.current = socket;

    // socket.on("connect", () => {
    //   console.log("✅ Socket connected:", socket.id);
    //   socket.emit("checkSession");
    // });

    socket.on("forceLogout", async (msg) => {
      console.log("🔴 forceLogout received");

      // 👇 Toast first
      toast.error(msg, { toastId: "forceLogout" });

      // 👇 Then update state & navigate
      
      dispatch(setUser(null));
      navigate("/login");

      // 👇 Delay disconnect to let React navigate
      setTimeout(() => {
        socket.disconnect();
        console.log("📴 Socket disconnected");
      }, 500);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Socket error:", err.message);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        console.log("💥 Socket manually disconnected");
      }
    };
  }, [user?.token]);

  return null;
};

export default SocketSetup;
