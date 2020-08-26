const socketio = require("socket.io");
const helpers = require("./helpers.js");

let users = {};
let sessions = {};

function sendSessionStateToUser(username) {
    let user = users[username];
    let session = sessions[user.session];
    let isCardCzar = session.redTeam.indexOf(username) == 0 || session.blueTeam.indexOf(username) == 0;
    let boardState = helpers.getBoardStateFromSession(session, isCardCzar);
    user.socket.emit('update_session_state', boardState);
}

function sendSessionState(session) {
    for(let i = 0; i < session.blueTeam.length; i++) {
        let username = session.blueTeam[i];
        sendSessionStateToUser(username);
    }
    for(let i = 0; i < session.redTeam.length; i++) {
        let username = session.redTeam[i];
        sendSessionStateToUser(username);
    }
}

// username is optional. Send to everyone that's not in a game if not specified
function sendSessions(username) {
    // prepare list of sessions
    let sessionsToSend = [];
    for(const roomName in sessions) {
        let session = sessions[roomName];
        sessionsToSend.push({
            roomName: roomName,
            host: session.host,
            players: session.redTeam.length + session.blueTeam.length
        });
    }

    // Send to the user or all users not in a game
    if(username) {
        users[username].socket.emit('update_session_list', sessionsToSend);
    } else {
        for(const username in users) {
            let user = users[username];
            if(!user.session) {
                user.socket.emit('update_session_list', sessionsToSend);
            }
        }
    }

}

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

        if(session.host == username) {
            if(session.blueTeam.length > 0) {
                session.host = session.blueTeam[0];
            } else if(session.redTeam.length > 0) {
                session.host = session.redTeam[0];
            }
        }

        sendSessionState(session);

        // If there are no users left in the session, remove it
        if(session.blueTeam.length == 0 && session.redTeam.length == 0) {
            console.log(`session ${session.roomName} deleted`);
            delete sessions[user.session];
            sendSessions();
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

    console.log(`${username} joined game ${session.roomName}`)
    sendSessionState(session);
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
    sendSessions();
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
        socket.on('request_session_state', () => { sendSessionStateToUser(username); });
        socket.on('request_sessions', () => { sendSessions(username); });
        socket.on('join_session', (roomName) => { joinSession(username, sessions[roomName]); });
    });
}

module.exports = {
    setupSocketIo: setupSocketIo
};