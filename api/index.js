require("dotenv").config();
const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const cors = require("cors");
const compression = require("compression");

const connectBdd = require("./middlewares/connectBdd");

const registerRouter = require("./routes/register");
const loginRouter = require("./routes/login");
const tasksRouter = require("./routes/tasks");
const logoutRouter = require("./routes/logout");

app.use(compression());
app.use(cors({
  origin: "http://localhost:8080",
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(connectBdd());

app.use("/api/register", registerRouter);
app.use("/api/login", loginRouter);
app.use("/api/tasks", tasksRouter);
app.use("/api/logout", logoutRouter);

io.on('connection', (socket) => {
  socket.on('sendNewTask', (newTask) => socket.broadcast.emit('addNewTask', newTask));
  socket.on('sendDeleteTask', (taskId) => socket.broadcast.emit('deleteTask', taskId));
  socket.on('sendUpdateTask', (taskUpdated) => socket.broadcast.emit('updateTask', taskUpdated));
});

server.listen(3000);
