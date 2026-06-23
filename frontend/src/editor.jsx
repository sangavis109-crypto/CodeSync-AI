import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import socket from "./socket";

function Editor() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [code, setCode] = useState("");
  const [users, setUsers] = useState(0);

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
    <div>
      <h1>Room ID</h1>
      <h2>{roomId}</h2>

      <h3>Users Online: {users}</h3>

      <button
  onClick={() => {
    navigator.clipboard.writeText(roomId);
    alert("Room ID copied!");
  }}
>
  Copy Room ID
</button>

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
      <br />
<br />

<button onClick={() => navigate("/")}>
  Leave Room
</button>
    </div>
  );
}

export default Editor;