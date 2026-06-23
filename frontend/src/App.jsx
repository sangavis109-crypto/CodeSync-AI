import { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Editor from "./editor";
import socket from "./socket";

function App() {

  const [roomId, setRoomId] = useState("");

  const navigate = useNavigate();

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
    alert("Joined Room!");
    navigate(`/editor/${roomId}`);
  }
};

 return (
  <Routes>
    <Route
      path="/"
      element={
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
        </>
      }
    />

    <Route path="/editor/:roomId" element={<Editor />} />
  </Routes>
);
}

export default App;