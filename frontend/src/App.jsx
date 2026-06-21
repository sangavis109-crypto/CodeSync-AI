import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

function App() {

  const joinRoom = () => {
    const roomId = "test-room";

    console.log("Button clicked");
    socket.emit("join-room", roomId);

    alert("Joined Room!");
  };

  return (
    <>
      <h1>CodeSync AI</h1>
      <button onClick={joinRoom}>
        Join Room
      </button>
    </>
  );
}

export default App;