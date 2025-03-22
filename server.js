const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());

io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    socket.on("callUser", (data) => {
        console.log(`Call request from ${data.from} to ${data.userToCall}`);
        io.to(data.userToCall).emit("callIncoming", { from: data.from, signal: data.signal });
    });

    socket.on("acceptCall", (data) => {
        console.log(`${data.to} accepted the call`);
        io.to(data.to).emit("callAccepted", { signal: data.signal });
    });

    socket.on("signal", (data) => {
        console.log(`Signal from ${socket.id} to ${data.target}`);
        io.to(data.target).emit("signal", { sender: socket.id, signal: data.signal });
    });
    socket.on("endCall", (data) => {
        console.log(`Call ended by ${socket.id}, notifying ${data.target}`);
        io.to(data.target).emit("endCall");
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});

server.listen(8000, "0.0.0.0", () => console.log("Server running on port 8000"));
