const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const multer = require("multer");
const path = require("path");

const AUTH_KEY = "YOUR_SECRET_KEY"; // change this before deploying

let messages = [];

app.use(express.static(__dirname + "/public"));
app.use(express.json());

const storage = multer.diskStorage({
  destination: "./public/uploads/",
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

app.post("/upload", upload.single("file"), (req, res) => {
  if (req.query.key !== AUTH_KEY) return res.sendStatus(403);
  res.json({ file: `/uploads/${req.file.filename}` });
});

app.get("/load", (req, res) => {
  if (req.query.key !== AUTH_KEY) return res.sendStatus(403);
  res.json(messages);
});

io.on("connection", (socket) => {
  socket.on("auth", (key) => {
    if (key !== AUTH_KEY) {
      socket.emit("auth_fail");
      return socket.disconnect();
    }

    socket.on("msg", (data) => {
      messages.push(data);
      if (messages.length > 200) messages.shift(); // limit
      io.emit("msg", data);
    });
  });
});

http.listen(3000, () => console.log("Running on port 3000"));
