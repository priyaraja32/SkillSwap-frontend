import { io } from "socket.io-client";

const socket = io("https://skillswap-backend-v4s4.onrender.com", {
  withCredentials: true,
  transports: ["websocket"],
  autoConnect: true,
});

socket.on("connect", () => {
  console.log(" Socket connected:", socket.id);
});

socket.on("disconnect", () => {
  console.log(" Socket disconnected");
});

export default socket;