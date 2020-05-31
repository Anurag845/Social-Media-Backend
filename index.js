//created by Hatem Ragap
require('dotenv').config({ debug: process.env.DEBUG });

const app = require('./app');

const port = process.env.PORT || 3000 ;

const socketIO = require("socket.io");
const server = require("http").createServer(app);
const io = socketIO(server);

io.onlineUsers = {};

require("./sokets/init.socket")(io);
require("./sokets/convs.socket")(io);
require("./sokets/message.socket")(io);
require("./sokets/chatSocket")(io);

app.get('/',function(req,res) {
    res.send("server work");
});

server.listen(port, () => {
    console.log('Running on port 3000...');
});
