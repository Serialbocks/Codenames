const socketio = require("socket.io");

function disconnect(reason) {
    console.log('user disconnected');
}

function setupSocketIo(server) {
    const io = socketio(server);

    io.on('connection', socket => {
      console.log("new user connected");

      socket.on('disconnect', disconnect);
    });
}

module.exports = {
    setupSocketIo: setupSocketIo
};