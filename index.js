const express = require('express')
const PORT = process.env.PORT || 5000
const app = express()
const cors = require("cors")
const connectDB = require("./config/db")
const userModel = require("./models/UserModel")
const messageModel = require("./models/MessageModel")
const userRoutes = require("./Routes/UserRoutes")
const messRoutes = require("./Routes/MessagesRoutes")
const colors = require("colors");
const bodyParser = require("body-parser");
connectDB()



app.get('/',(req,res)=>{
    res.send('WhatsApp Clone')
})
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use(
  cors({
    origin: "*",
    allowOrigin: true,
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  })
);
app.use(express.json())
app.use(userRoutes)
app.use(messRoutes);
const server = app.listen(PORT, () =>{
    console.log(`server is running on PORT ${PORT}`.cyan)
})


const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
  },
});

io.on("connection", (socket) =>{
  console.log('Connected to Socket.io')

  socket.on('setup',(user)=>{
    socket.join(user)
    socket.emit("connected")
    console.log(`${user} setting-up`)
  })

  socket.on("select user",(selectedUser)=>{
    socket.join(selectedUser)
    console.log(`User select ${selectedUser}`)


    socket.on("new message",(newMessage)=>{
      socket.in(newMessage.to).emit('message recieved',newMessage)
      console.log(newMessage)
    })
  })
})

