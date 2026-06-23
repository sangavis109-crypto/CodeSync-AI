const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-room", (roomId) => {
  console.log("Join-room event received");
  console.log(roomId);

  socket.join(roomId);

  socket.to(roomId).emit(
    "user-connected",
    "A new user joined the room"
  );

  const users = io.sockets.adapter.rooms.get(roomId)?.size || 0;

  io.to(roomId).emit("user-count", users);

  console.log(`User joined room: ${roomId}`);
});

  socket.on("code-change", (data) => {
  socket.to(data.roomId).emit("receive-code", data.code);
});
socket.on("disconnect", () => {
  console.log("User disconnected:", socket.id);
});
});

server.listen(5000, () => {
  console.log("Server running on port 5000");
});