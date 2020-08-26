const socketio = require("socket.io");
const helpers = require("./helpers.js");

let users = {};
let sessions = {};

function disconnect(reason, username) {
    let user = users[username];
    if(user.session) {
        // remove user from session
        let session = sessions[user.session];
        let index = session.blueTeam.indexOf(username);
        if(index >= 0) {
            session.blueTeam.splice(index, 1);
        }
        index = session.redTeam.indexOf(username);
        if(index >= 0) {
            session.redTeam.splice(index, 1);
        }

        // If there are no users left in the session, remove it
        if(session.blueTeam.length == 0 && session.redTeam.length == 0) {
            console.log(`session ${session.roomName} deleted`);
            delete sessions[user.session];
        }
    }

    // Remove the user
    delete users[username];
    console.log(`${username} disconnected`);
}

function changeUsername(oldName, newName, socket) {
    if(users[newName] !== undefined) {
        socket.emit('error_msg', 'Username is already in use.');
        socket.emit('username_unchanged');
        return false;
    }

    users[newName] = users[oldName];
    delete users[oldName];
    socket.emit('username_changed');
    console.log(`${oldName} changed name to ${newName}`);
    return true;
}

function joinSession(username, session) {
    let user = users[username];
    user.session = session.roomName;
    if(session.blueTeam.length < session.redTeam.length) {
        session.blueTeam.push(username);
    } else {
        session.redTeam.push(username);
    }

    user.socket.emit('enter_game_session', session.roomName);
}

function createNewSession(args, username) {
    let user = users[username];
    if(sessions[args.roomName] !== undefined) {
        user.socket.emit('error_msg', `A room named "${args.roomName}" already exists.`);
        return;
    }

    sessions[args.roomName] = helpers.setupSessionObject(args, username);
    joinSession(username, sessions[args.roomName]);
    console.log(`${username} created a new room ${args.roomName}`);
}

function sendSessionState(username) {
    let user = users[username];
    let session = sessions[user.session];
    user.socket.emit('update_session_state', session);
}

function setupSocketIo(server) {
    const io = socketio(server);

    io.on('connection', socket => {
        // Set up user info
        console.log("new user connected");
        let username = "Anonymous";
        let count = 1;
        while(users[username] !== undefined && count < 100) {
            username = `Anonymous${count}`;
            count++;
        }

        users[username] = {
            socket: socket
        };

        socket.on('disconnect', (reason) => { disconnect(reason, username); });
        socket.on('change_username', (newName) => {
            if(changeUsername(username, newName, socket)) {
                username = newName; 
            }
        });
        socket.on('create_new_session', (args) => { createNewSession(args, username); });
        socket.on('request_session_state', () => { sendSessionState(username); });
    });
}

module.exports = {
    setupSocketIo: setupSocketIo
};