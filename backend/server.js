require("dotenv").config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { exec } = require("child_process");
const vm = require("node:vm");

const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});


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

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",

      messages: [
        {
          role: "system",
          content:
            "You are a senior software engineer. Review the given code and find bugs, security issues, performance problems and improvements."
        },
        {
          role: "user",
          content: `
Language: ${language}

Code:
${code}

Give a clear code review with:
1. Bugs
2. Security issues
3. Performance improvements
4. Best practices
`
        }
      ]
    });


    const review = response.choices[0].message.content;


    res.json({
      review: review
    });


  } catch (error) {

    console.log("Groq Error:", error.message);


    const fallbackReview = `
🤖 AI Code Review

✅ Code Analysis:
Your code structure looks readable.

🐛 Possible Issues:
- Check syntax errors.
- Add proper error handling.
- Avoid duplicate code.

🔒 Security:
- Keep API keys hidden.
- Validate user inputs.

💡 Improvements:
- Use meaningful variable names.
- Add comments.
- Follow clean coding practices.

⚡ Note:
AI service unavailable. Showing fallback review.
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