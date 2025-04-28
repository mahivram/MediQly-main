import http from "http";
import app from "./app.js";
import { Server } from "socket.io";
import { setupSocketIO } from "./chat/chathandler.controller.js";

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

setupSocketIO(server);
// const io = new Server(server, {

//   cors: {
//     origin: "http://localhost:8080",
//   },
// });

// io.on("connect", (socket) => {
//   console.log("a user connected", socket.id);
//   socket.on("disconnect", () => {
//     console.log("user disconnected");
//   });
//   socket.on("create-something", (data) => {
//     console.log(data, "got data");
//   });
// });


server.listen(PORT, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log(`server running on PORT ${PORT}`);
  }
});
