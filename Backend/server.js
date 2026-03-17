const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const http = require("http");
const cors = require("cors");
const path = require("path");
const socket = require("socket.io");
const database = require("./app/Database/database");
const userRoute = require("./app/Routes/UserRoute");
const fileRoute = require("./app/Routes/upload");
const {socketHandler} = require("./app/Controller/Socket");
const auth = require("./app/middlemare/auth");
const encryptMiddleware = require('./app/middlemare/cryptoMiddleware');

const app = express();
const server = http.createServer(app);
app.use(cors({
  origin: process.env.Frontend_URI,
  methods: ["GET","POST","PUT","DELETE"],
  credentials: true
}));
const io = socket(server, {
  cors: {
    origin: process.env.Frontend_URI,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
}); 
socketHandler(io);
database();
app.use(express.json());
app.use(encryptMiddleware);
app.use("/api/v1/user", auth, userRoute);
app.use("/api/v1/file", auth, fileRoute);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "app/views"));
server.listen(process.env.PORT, (err) => {
  if (err) console.error("Error starting server:", err);
  console.log(`Server is running on port ${process.env.PORT}`);
});
