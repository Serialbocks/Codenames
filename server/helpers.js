const words = require('./words.js');

function randomizeBoard(session) {
    let regularWords = words.slice();
    let customWords = session.customWords ? session.customWords.slice() : [];

    let bagOfColors = ["red", "red", "red", "red", "red", "red", "red", "red",
                       "blue", "blue", "blue", "blue", "blue", "blue", "blue", "blue", 
                       "white", "white", "white", "white", "white", "white", "white",
                       "black"];
    session.startingTeam = Math.floor(Math.random() * 2) == 0 ? "red" : "blue";
    bagOfColors.push(session.startingTeam); // The starting team has one more card to guess
    let wordArray = [];
    session.redCount = 0;
    session.blueCount = 0;
    // Select 25 random words
    for(let i = 0; i < 25; i++) {
        let isCustom = false;
        if(customWords.length > 0) {
            isCustom = Math.floor(Math.random() * 100) <= session.customWordFrequency;
        }

        let bagOfWords = isCustom ? customWords : regularWords;
        let wordIndex = Math.floor(Math.random() * bagOfWords.length);
        let colorIndex = Math.floor(Math.random() * bagOfColors.length);
        let colorChosen = bagOfColors[colorIndex];
        if(colorChosen == "red") {
            session.redCount++;
        } else if(colorChosen == "blue") {
            session.blueCount++;
        }
        wordArray.push({
            word: bagOfWords[wordIndex].toUpperCase(),
            color: bagOfColors[colorIndex],
            revealed: false
        });
        bagOfWords.splice(wordIndex, 1);
        bagOfColors.splice(colorIndex, 1);
    }
    session.board = wordArray;

    return session;
}

function randomizeTeams(session) {
    let allTeams = session.blueTeam.concat(session.redTeam);
    let isRed = Math.floor(Math.random() * 2) == 1;
    let newBlueTeam = [];
    let newRedTeam = [];
    for(let i = 0; i < session.blueTeam.length + session.redTeam.length; i++) {
        let index = Math.floor(Math.random() * allTeams.length);
        if(isRed) {
            newRedTeam.push(allTeams[index])
        } else {
            newBlueTeam.push(allTeams[index]);
        }
        isRed = !isRed;
        allTeams.splice(index, 1);
    }

    session.redTeam = newRedTeam;
    session.blueTeam = newBlueTeam;

    if(session.redTeam.length > 0) {
        session.redCzar = session.redTeam[0];
    } else {
        session.redCzar = undefined;
    }
    if(session.blueTeam.length > 0) {
        session.blueCzar = session.blueTeam[0];
    } else {
        session.blueCzar = undefined;
    }

    return session;
}

function setupSessionObject(args, username) {
    let session = {
        roomName: args.roomName,
        customWords: args.customWords,
        customWordFrequency: args.customWordFrequency,
        host: username,
        redTeam: [],
        blueTeam: []
    };
    session = randomizeBoard(session);
    return session;
}

function getBoardStateFromSession(session, isCardCzar) {
    let toReturn = {
        roomName: session.roomName,
        host: session.host,
        redTeam: session.redTeam,
        blueTeam: session.blueTeam,
        redCzar: session.redCzar,
        blueCzar: session.blueCzar,
        redCount: session.redCount,
        blueCount: session.blueCount,
        board: []
    };

    for(let i = 0; i < session.board.length; i++) {
        let item = session.board[i];
        let objToPush = {
            word: item.word,
            revealed: item.revealed
        };
        // only reveal the color of the word if czar or revealed
        if(isCardCzar || item.revealed) {
            objToPush.color = item.color
        }
        toReturn.board.push(objToPush);
    }
    return toReturn;
}

module.exports = {
    setupSessionObject: setupSessionObject,
    randomizeBoard: randomizeBoard,
    getBoardStateFromSession: getBoardStateFromSession,
    randomizeTeams: randomizeTeams
};