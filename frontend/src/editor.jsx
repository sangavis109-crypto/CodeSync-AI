import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { socket } from "./socket";

function Editor() {
  const { roomId } = useParams();

  useEffect(() => {
    socket.emit("join-room", roomId);

    socket.on("user-connected", (message) => {
      alert(message);
    });

    return () => {
      socket.off("user-connected");
    };
  }, [roomId]);

  return (
    <div>
      <h1>Room ID</h1>
      <h2>{roomId}</h2>
    </div>
  );
}

export default Editor;