const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { exec } = require("child_process");
const vm = require("node:vm");

const app = express();

app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

app.post("/run", (req, res) => {
  const { code, language } = req.body;

  console.log("Run Request Received");
  console.log("Language:", language);

  if (language !== "javascript") {
    return res.json({
      output: "Currently only JavaScript execution is supported."
    });
  }

  let output = "";

  const sandbox = {
    console: {
      log: (...args) => {
        output += args.join(" ") + "\n";
      }
    }
  };

  try {
    vm.createContext(sandbox);
    vm.runInContext(code, sandbox);

    res.json({
      output: output || "Code executed successfully (no output)."
    });

  } catch (error) {
    res.json({
      output: "Error: " + error.message
    });
}
});
app.post("/review", (req, res) => {
  const { code, language } = req.body;

  console.log("AI Review Request Received");
  console.log("Language:", language);

  if (!code.trim()) {
    return res.json({
      review: "⚠️ Please enter some code for review."
    });
  }

  res.json({
    review: `
🤖 AI Code Review

Language: ${language}

✅ Code Analysis:
Your code structure looks readable.

🐛 Possible Issues:
- Check for syntax errors.
- Add proper error handling.

💡 Suggestions:
- Use meaningful variable names.
- Add comments for complex logic.
- Follow best coding practices.
`
  });
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