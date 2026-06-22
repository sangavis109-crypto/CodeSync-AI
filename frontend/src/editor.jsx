import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import socket from "./socket";

function Editor() {
 const roomId = "test-room";

  const [code, setCode] = useState("");

  useEffect(() => {
    socket.emit("join-room", roomId);

    socket.on("user-connected", (message) => {
      alert(message);
    });

    socket.on("receive-code", (newCode) => {
  console.log("Received:", newCode);
  setCode(newCode);
});

    return () => {
      socket.off("user-connected");
    };
  }, [roomId]);

 return (
  <div>
    <h1>Room ID</h1>
    <h2>{roomId}</h2>

    <h2>Code Editor</h2>

  <textarea
  rows="20"
  cols="80"
  placeholder="Write code here..."
  value={code}
  onChange={(e) => {
    setCode(e.target.value);

    socket.emit("code-change", {
      roomId,
      code: e.target.value,
    });
  }}
></textarea>
  </div>
);
}

export default Editor;