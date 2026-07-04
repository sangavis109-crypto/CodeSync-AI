import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import socket from "./socket";
import MonacoEditor from "@monaco-editor/react";
import axios from "axios";

function EditorPage()  {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [code, setCode] = useState("");
  const [users, setUsers] = useState(0);
  const [language, setLanguage] = useState("javascript");
  const [theme, setTheme] = useState("vs-dark");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);


  function downloadCode() {
  const extensions = {
    javascript: "js",
    java: "java",
    python: "py",
    c: "c",
    cpp: "cpp",
  };

  const extension = extensions[language];

  const element = document.createElement("a");

  const file = new Blob([code], {
    type: "text/plain",
  });

  element.href = URL.createObjectURL(file);
  element.download = `code.${extension}`;

  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}   

async function runCode() {
  setLoading(true);
setOutput("Running...");
  try {
    const response = await axios.post("http://localhost:5000/run", {
      code,
      language,
    });

    console.log(response.data);

    setOutput(response.data.output);
  } catch (error) {
    setOutput("Error connecting to backend");
    console.error(error);
  }
  finally {
  setLoading(false);
}
}

  useEffect(() => {
    socket.emit("join-room", roomId);

    socket.on("user-connected", (message) => {
      alert(message);
    });

    socket.on("receive-code", (newCode) => {
      console.log("Received:", newCode);
      setCode(newCode);
    });

    socket.on("user-count", (count) => {
  setUsers(count);
});

    return () => {
  socket.off("user-connected");
  socket.off("receive-code");
  socket.off("user-count");
};
  }, [roomId]);

  return (
    <div
  style={{
    padding: "20px",
    background: "#f3f4f6",
    minHeight: "100vh",
  }}
>
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      background: "#1e3a8a",
      color: "white",
      padding: "15px 25px",
      borderRadius: "12px",
      marginBottom: "20px",
    }}
  >
    <div>
      <h2>🚀 CodeSync AI</h2>
      <p>Room ID: {roomId}</p>
      <p>👥 Users Online: {users}</p>
    </div>

    <div>
      <button
        onClick={() => {
          navigator.clipboard.writeText(roomId);
          alert("Room ID Copied!");
        }}
      >
        Copy Room ID
      </button>

      <button
  onClick={() => setCode("")}
  style={{
    marginLeft: "10px",
  }}
>
  📄 New File
</button>

<button
  onClick={downloadCode}
  style={{
    marginLeft: "10px",
  }}
>
  💾 Download
</button>

<h3>Output</h3>

<div
  style={{
    backgroundColor: "#1e1e1e",
    color: "#00ff00",
    padding: "15px",
    borderRadius: "8px",
    minHeight: "100px",
    marginTop: "20px",
    textAlign: "left",
    whiteSpace: "pre-wrap",
  }}
>
  {output || "Output will appear here..."}
</div>

      <button
        onClick={() => navigate("/")}
        style={{ marginLeft: "10px" }}
      >
        Leave Room
      </button>
    </div>
  </div>

      <h2>Code Editor</h2>
<button
  onClick={runCode}
  style={{
    backgroundColor: "#22c55e",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "8px",
    marginBottom: "15px",
    cursor: "pointer",
  }}
>
  ▶ Run Code
</button>

      <div style={{ marginBottom: "15px" }}>
  <label
    style={{
      fontWeight: "bold",
      marginRight: "10px",
    }}
  >
    Select Language:
  </label>

  <select
    value={language}
    onChange={(e) => setLanguage(e.target.value)}
    style={{
      padding: "8px",
      borderRadius: "6px",
    }}
  >
    <option value="javascript">JavaScript</option>
    <option value="java">Java</option>
    <option value="python">Python</option>
    <option value="cpp">C++</option>
    <option value="c">C</option>
  </select>
</div>
<div style={{ marginBottom: "15px" }}>
  <label
    style={{
      fontWeight: "bold",
      marginRight: "10px",
    }}
  >
    Select Theme:
  </label>

  <select
    value={theme}
    onChange={(e) => setTheme(e.target.value)}
    style={{
      padding: "8px",
      borderRadius: "6px",
    }}
  >
    <option value="vs-dark">Dark</option>
    <option value="light">Light</option>
  </select>
</div>

      <MonacoEditor
  height="500px"
  language={language}
  theme={theme}
  value={code}
  onChange={(value) => {
    setCode(value || "");

    socket.emit("code-change", {
      roomId,
      code: value || "",
    });
  }}
/>
      <br />
<br />

    </div>
  );
}

export default EditorPage;