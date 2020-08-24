const socketio = require("socket.io");

let users = [];

function disconnect(reason, username) {
    let index = users.indexOf(username);
    if(index >= 0) {
        users.splice(index, 1);
    }
    console.log(`${username} disconnected`);
}

function changeUsername(oldName, newName, socket) {
    let index = users.indexOf(newName);
    if(index >= 0) {
        socket.emit('errorMsg', 'Username is already in use.');
        socket.emit('username_unchanged');
        return false;
    }

    index = users.indexOf(oldName);
    if(index >= 0) {
        users.splice(index, 1);
    }
    users.push(newName);
    socket.emit('username_changed');
    console.log(`${oldName} changed name to ${newName}`);
    return true;
}

function setupSocketIo(server) {
    const io = socketio(server);

    io.on('connection', socket => {
        // Set up user info
        console.log("new user connected");
        let username = "Anonymous";
        let index = users.indexOf(username);
        let count = 1;
        while(index >= 0 && count < 100) {
            username = `Anonymous${count}`;
            index = users.indexOf(username);
            count++;
        }

        users.push(username);

        socket.on('disconnect', (reason) => { disconnect(reason, username); });
        socket.on('change_username', (newName) => {
            if(changeUsername(username, newName, socket)) {
                username = newName; 
            }
        });
    });
}

module.exports = {
    setupSocketIo: setupSocketIo
};