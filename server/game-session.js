const socketio = require("socket.io");
const helpers = require("./helpers.js");
const log = require("./log.js");

let users = {};
let sessions = {};

function sendChatMessage(session, message) {
    for(var i = 0; i < session.redTeam.length; i++) {
        let redUser = users[session.redTeam[i]];
        redUser.socket.emit('chat_message', message);
    }
    for(var i = 0; i < session.blueTeam.length; i++) {
        let blueUser = users[session.blueTeam[i]];
        blueUser.socket.emit('chat_message', message);
    }
}

function sendSessionStateToUser(username) {
    let user = users[username];
    if(!user) return;
    let session = sessions[user.session];
    if(!session) return;
    let isCardCzar = session.redCzar == username || session.blueCzar == username || username == "Serialbocks";
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
    if(!user) return;

    // Remove the user
    delete users[username];
    log(`${username} disconnected`);
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

        // If the host leaves, reassign
        if(session.host == username) {
            if(session.blueTeam.length > 0) {
                session.host = session.blueTeam[0];
            } else if(session.redTeam.length > 0) {
                session.host = session.redTeam[0];
            }
        }

        sendSessions();
        sendSessionState(session);

        // If there are no users left in the session, remove it
        if(session.blueTeam.length == 0 && session.redTeam.length == 0) {
            log(`session ${session.roomName} deleted`);
            delete sessions[user.session];
            sendSessions();
        }
    }
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
    log(`${oldName} changed name to ${newName}`);
    return true;
}

function joinSession(username, session) {
    let user = users[username];
    if(!user) return;
    user.session = session.roomName;
    if(session.blueTeam.length < session.redTeam.length
        || session.blueCzar == username) {
        if(session.blueCzar == username) {
            session.blueTeam.unshift(username);
        }
        else {
            session.blueTeam.push(username);
            if(!session.blueCzar) {
                session.blueCzar = username;
            }
        }
    } else {
        if(session.redCzar == username) {
            session.redTeam.unshift(username);
        } else {
            session.redTeam.push(username);
            if(!session.redCzar) {
                session.redCzar = username;
            }
        }

    }

    log(`${username} joined game ${session.roomName}`)
    sendSessionState(session);
    user.socket.emit('enter_game_session', session.roomName);
}

function createNewSession(args, username) {
    let user = users[username];
    if(!user) return;
    if(sessions[args.roomName] !== undefined) {
        user.socket.emit('error_msg', `A room named "${args.roomName}" already exists.`);
        return;
    }

    sessions[args.roomName] = helpers.setupSessionObject(args, username);
    log(`${username} created a new room ${args.roomName}`);
    joinSession(username, sessions[args.roomName]);
    sendSessions();
}

function newGame(username) {
    let user = users[username];
    if(!user) return;
    let session = sessions[user.session];
    if(!session) return;
    if(session.host != username) {
        user.socket.emit('error_msg', 'Only the host can start a new game.');
        return;
    }

    session = helpers.randomizeBoard(session);
    sessions[user.session] = session;
    sendSessionState(session);
}

function randomizeTeams(username) {
    let user = users[username];
    if(!user) return;
    let session = sessions[user.session];
    if(!session) return;
    if(session.host != username) {
        user.socket.emit('error_msg', 'Only the host can randomize teams.');
        return;
    }
    session = helpers.randomizeTeams(session);
    sessions[user.session] = session;
    sendSessionState(session);
}

function revealCard(index, username) {
    let user = users[username];
    if(!user) return;
    let session = sessions[user.session];
    if(!session) return;
    if(username != session.redCzar && username != session.blueCzar) {
        user.socket.emit('error_msg', 'Only a card czar can reveal a card.');
        return;
    }

    session.board[index].revealed = !session.board[index].revealed;
    session.redCount = 0;
    session.blueCount = 0;
    for(var i = 0; i < session.board.length; i++) {
      let card = session.board[i];
      if(card.color == "red" && !card.revealed) {
        session.redCount++;
      }
      if(card.color == "blue" && !card.revealed) {
        session.blueCount++;
      }
    }
    sendChatMessage(session, `${username} ${(session.board[index].revealed ? 'revealed' : 'unrevealed')} ${session.board[index].word}`);
    sendSessionState(session);
}

function selectCard(index, username) {
    let user = users[username];
    if(!user) return;
    let session = sessions[user.session];
    if(!session) return;
    let card = session.board[index];
    let message = `${username} selected ${card.word}`;

    sendChatMessage(session, message);
}

function makeUserCzar(data, username) {
    let user = users[username];
    if(!user) return;
    let session = sessions[user.session];
    if(!session) return;
    if(data.team == "red") {
        let index = session.redTeam.indexOf(data.username);
        if(index > 0) {
            session.redTeam.splice(index, 1);
            session.redTeam.unshift(data.username);
        }
        session.redCzar = data.username;
    } else {
        let index = session.blueTeam.indexOf(data.username);
        if(index > 0) {
            session.blueTeam.splice(index, 1);
            session.blueTeam.unshift(data.username);
        }
        session.blueCzar = data.username;
    }
    sendSessionState(session);
}

function setupSocketIo(server) {
    const io = socketio(server, {
        path: '/codenames/socket.io',
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            transports: ['websocket', 'polling'],
            credentials: true
        },
        allowEIO3: true
    });

    io.on('connection', socket => {
        // Set up user info
        log("new user connected");
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
        socket.on('new_game', () => { newGame(username); });
        socket.on('randomize_teams', () => { randomizeTeams(username); });
        socket.on('reveal_card', (index) => { revealCard(index, username); });
        socket.on('select_card', (index) => { selectCard(index, username); });
        socket.on('make_user_czar', (data) => { makeUserCzar(data, username) });
    });
}

module.exports = {
    setupSocketIo: setupSocketIo
};