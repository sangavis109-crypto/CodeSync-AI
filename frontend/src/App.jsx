import { useState, useEffect } from "react";
import socket from "./socket";
import Editor from "./editor";

function App() {

  const [roomId, setRoomId] = useState("");

  useEffect(() => {

  socket.on("user-connected", (message) => {
    console.log(message);
    alert(message);
  });

  return () => {
    socket.off("user-connected");
  };

}, []);

  const joinRoom = () => {

    if (roomId !== "") {
      socket.emit("join-room", roomId);
      alert("Joined Room!");
    }

  };

  return (
    <>
      <h1>CodeSync AI</h1>

      <input
        type="text"
        placeholder="Enter Room ID"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
      />

      <br />
      <br />

      <button onClick={joinRoom}>
        Join Room
      </button>
      <Editor />

    </>
  );
}

export default App;