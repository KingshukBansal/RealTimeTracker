const express = require("express");
const app = express();
const http = require("http");
const path = require("path");
const socketio = require("socket.io");

const server = http.createServer(app);
const io = socketio(server);

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

io.on("connection", function(socket){
    console.log("A user connected:", socket.id);

    // Listen for 'send-location' events from clients
    socket.on("send-location", function(data){
        console.log("Location received from", socket.id, ":", data);
        // Emit 'receive-location' to all clients except the sender
        socket.broadcast.emit("receive-location", { id: socket.id, ...data });
    });

    // Handle user disconnection
    socket.on("disconnect", function(){
        console.log("User disconnected:", socket.id);
        // Emit 'user-disconnected' to all clients
        socket.broadcast.emit("user-disconnected", socket.id);
    });
});

app.get("/", function (req, res){
    res.render("index");
});

// Use server.listen instead of app.listen
server.listen(3000, function(){
    console.log("Server is running on port 3000");
});
