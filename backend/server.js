require("dotenv").config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { exec } = require("child_process");
const vm = require("node:vm");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


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
app.post("/review", async (req, res) => {
  const { code, language } = req.body;

  console.log("AI Review Request Received");
  console.log("Language:", language);

  if (!code.trim()) {
    return res.json({
      review: "⚠️ Please enter some code for review."
    });
  }

  try {
    const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});

    const prompt = `
You are a senior software engineer.

Review this ${language} code.

Find:
1. Bugs
2. Security issues
3. Performance problems
4. Improvements
5. Best practices

Code:

${code}
`;

    const result = await model.generateContent(prompt);

    const response = result.response;

    res.json({
      review: response.text()
    });

  } catch (error) {
  console.log("Gemini Error:", error.message);

  const fallbackReview = `
🤖 AI Code Review

✅ Code Analysis:
Your code structure looks readable and follows basic programming practices.

🐛 Possible Issues:
- Check syntax errors before execution.
- Add proper error handling.
- Avoid repeating duplicate code.
- Validate user inputs.

🔒 Security Suggestions:
- Never expose API keys.
- Validate incoming requests.
- Keep sensitive information inside environment variables.

💡 Improvements:
- Use meaningful variable names.
- Add comments for complex logic.
- Follow clean coding practices.
- Optimize code performance.

⚡ Note:
AI service is temporarily unavailable. Showing automated review suggestions.
`;

  res.json({
    review: fallbackReview
  });
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