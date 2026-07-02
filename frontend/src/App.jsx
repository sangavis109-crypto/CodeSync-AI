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
          <div
  style={{
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "#f4f6f8",
  }}
>
  <div
    style={{
      background: "white",
      padding: "40px",
      borderRadius: "10px",
      boxShadow: "0 0 10px rgba(0,0,0,0.2)",
      textAlign: "center",
      width: "350px",
    }}
  >
    <h1
  style={{
    color: "#1e3a8a",
    fontSize: "45px",
    marginBottom: "20px",
  }}
>
  🚀 CodeSync AI
</h1>

    <p
  style={{
    color: "#6b7280",
    fontSize: "22px",
    marginBottom: "30px",
  }}
>
  Real-Time Collaborative Code Editor
</p>

    <input
      type="text"
      placeholder="Enter Room ID"
      value={roomId}
      onChange={(e) => setRoomId(e.target.value)}
      style={{
        width: "90%",
        padding: "10px",
        marginTop: "15px",
        borderRadius: "5px",
        border: "1px solid gray",
      }}
    />

    <br />
    <br />

    <button
      onClick={joinRoom}
      style={{
        background: "#007bff",
        color: "white",
        padding: "10px 20px",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
      }}
    >
      Join Room
    </button>
  </div>
</div>
        </>
      }
    />

    <Route path="/editor/:roomId" element={<Editor />} />
  </Routes>
);
}

export default App;