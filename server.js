const express = require('express')
const socket = require('socket.io');
//const without = require('lodash');
const gameHeight = 600;
const gameWidth = 600;
const rounds = 1;

var count = 0;

const app = express();

const port = process.env.PORT || 4000;

const server = app.listen(port, () => {
    console.log("server is running on port " + port)
});
var io = socket(server);

app.use(express.static('public'));


io.sockets.on('connection', (socket) => {

    socket.on('setNickname', (data) => {
        socket.nickname = data
    })

    socket.on('create', ({ roomId, type }) => {

        let roomName = "room-" + roomId
        console.log(io.sockets.clients())
        if (type === 'join') {
            if (!io.sockets.adapter.rooms[roomName]) {
                socket.emit('errorMessage', 'game does not exist')
                return;
            }
            else if (io.sockets.adapter.rooms[roomName].started === true) {
                socket.emit('errorMessage', 'game already started')
                return;
            }
        }

        socket.join(roomName, () => {
            console.log(`${socket.nickname} has joined ${roomName}`)
            socket.emit('connectedToServer')
            let room = io.sockets.adapter.rooms[roomName];
            console.log(room.length)
            socket.roomId = roomId
            if (!room.roomSockets) {
                room.roomSockets = [];
            }
            room.roomSockets.push(socket);
            console.log(`${roomName} holds ${room.roomSockets.length} people`)

            room.roomSockets.forEach(player => {
                socket.emit('connectionMade', { nickname: player.nickname, id: player.id })
            })
            socket.broadcast.in(roomName).emit('connectionMade', { nickname: socket.nickname, id: socket.id });
        });
        let room = io.sockets.adapter.rooms[roomName];

    })
    socket.on('startGame', () => {
        let room = io.sockets.adapter.rooms[`room-${socket.roomId}`];
        if (room.roomSockets.length > 1) {
            room.started = true;
            initGame(socket.roomId)
        }

    })

    socket.on('setPhrase', (phrase) => {
        setPhrase(socket.roomId, phrase)
        setUpMinorTurn(socket.roomId);
    });
    socket.on('guessLetter', (letter) => {
        let roomName = `room-${socket.roomId}`
        let room = io.sockets.adapter.rooms[roomName];
        let { score } = checkForLetter(socket.roomId, letter);

        if (score === 0) {
            room.failedLetters.push(letter);
            io.sockets.in(roomName).emit('failedLetters', letter);
        } else {
            io.sockets.in(roomName).emit('emitCodedPhrase', room.codedPhrase, false);

            console.log('score' + score)
            updateScore(socket.roomId, socket, score);
        }
        let next = checkIfTurnOver(socket.roomId);
        if (next) {
            nextTurn(socket.roomId);
        } else {
            minorTurn(socket.roomId)
        }



    })
    socket.on('guessPhrase', (phrase) => {
        let roomName = `room-${socket.roomId}`
        let room = io.sockets.adapter.rooms[roomName];

        let tempPhrase = room.phrase.toLowerCase();
        if (tempPhrase === phrase.toLowerCase()) {
            io.sockets.in(roomName).emit('emitCodedPhrase', phrase, true);
            updateScore(socket.roomId, socket, 5)
            nextTurn(socket.roomId);
        } else {

            updateScore(socket.roomId, socket, -2)
            minorTurn(socket.roomId);
        }
    })
    socket.on('leave game', () => {
        let roomName = `room-${socket.roomId}`
        let room = io.sockets.adapter.rooms[roomName];

        disconnect(socket.roomId, socket)

        console.log(room.length, " 1")
        socket.leave(roomName);
        console.log(room.length, " 2")

        socket.roomId = ''

    })
    socket.on('disconnect', () => {
        disconnect(socket.roomId, socket)
    })


    console.log('connection')
})

function disconnect(roomId, socket) {
    let roomName = 'room-' + roomId;
    let room = io.sockets.adapter.rooms[roomName];

    if (!room) {
        return
    }
    for (var i = 0; i < room.roomSockets.length; i++) {
        if (room.roomSockets[i].id === socket.id) {
            room.roomSockets.splice(i, 1);
        }
    }

    if (room.started) {
        room.playerList = room.playerList.filter(player => {
            return player.id != socket.id;
        })
        io.sockets.in(roomName).emit('updateScore', room.playerList);
        if (room.playerList.length === 1) {
            endGame(roomId);
        }
        if (room.currentTurnList && room.currentTurnList.length > 1 && room.currentTurnList[0] === socket.index) {
            nextTurn(roomId)
        } else if (room.minorTurnList && room.minorTurnList.length > 1 && room.minorTurnList[0] === socket.index) {
            minorTurn(roomId)
        }
        room.minorTurnList = room.minorTurnList.filter(player => {
            return player != socket.index;
        })
        console.log(room.minorTurnList)

        room.currentTurnList = room.currentTurnList.filter(player => {
            return player != socket.index;
        })


    }
    io.sockets.in(roomName).emit('removeFromWaitlist', socket.id);

}


function initGame(roomId) {
    let roomName = 'room-' + roomId;
    let room = io.sockets.adapter.rooms[roomName];
    var index = 0;
    room.currentTurnList = [];
    room.minorTurnList = [];
    room.playerList = [];
    room.failedLetters = [];
    room.round = 0;
    room.roomSockets.forEach(player => {
        player.score = 0;
        player.index = index;
        room.currentTurnList.push(index);
        room.playerList.push({
            id: player.id,
            nickname: player.nickname,
            score: player.score,
            guessing: false,
            turn: false,
            index: index
        })
        index += 1;
    })
    room.roomSockets.forEach(player => {
        player.emit('yourTurn', room.currentTurnList[0] === player.index);
        player.emit('gameNowStarting')
        player.emit('updateScore', room.playerList)
    })

    let findId = room.playerList.find(player => player.index === room.currentTurnList[0])
    findId.turn = true;
    io.sockets.in(roomName).emit('newTurn', findId)
}

function nextTurn(roomId) {
    let roomName = 'room-' + roomId;
    let room = io.sockets.adapter.rooms[roomName];
    room.currentTurnList.push(room.currentTurnList.shift());
    io.sockets.in(roomName).emit('yourMinorTurn', false)
    io.sockets.in(roomName).emit('newGuesser', null)

    const min = Math.min(...room.currentTurnList)
    if (room.currentTurnList[0] === min) {
        room.round += 1;
        if (room.round === rounds) {
            endGame(roomId);
            return;
        }
    }

    room.failedLetters = [];

    room.roomSockets.forEach(player => {
        player.emit('yourTurn', room.currentTurnList[0] === player.index)
    })
    room.playerList.forEach(player => {
        player.turn = false;
    })
    let findId = room.playerList.find(player => player.index === room.currentTurnList[0])
    findId.turn = true;

    io.sockets.in(roomName).emit('newTurn', findId)

}

function setUpMinorTurn(roomId) {
    let roomName = 'room-' + roomId;
    let room = io.sockets.adapter.rooms[roomName];
    room.minorTurnList = []
    room.roomSockets.forEach(player => {
        if (player.index != room.currentTurnList[0]) {
            room.minorTurnList.push(player.index);
        }
    })

    let temp = room.minorTurnList.filter(num => {
        return num < room.currentTurnList[0]
    })

    room.minorTurnList = room.minorTurnList.filter(num => {
        return num > room.currentTurnList[0]
    })


    room.minorTurnList = room.minorTurnList.concat(temp);

    room.roomSockets.forEach(player => {
        player.emit('yourMinorTurn', room.minorTurnList[0] === player.index)
    })
    let findId = room.playerList.find(player => player.index === room.minorTurnList[0])

    io.sockets.in(roomName).emit('newGuesser', findId)
}

function setPhrase(roomId, phrase) {
    let roomName = 'room-' + roomId;
    let room = io.sockets.adapter.rooms[roomName];
    room.phrase = phrase;
    let tempPhrase = phrase;
    tempPhrase = tempPhrase.replace(/[a-zA-Z]/gi, "_")
    room.codedPhrase = tempPhrase;
    console.log(tempPhrase);
    io.sockets.in(roomName).emit('emitCodedPhrase', room.codedPhrase, true)
}

function minorTurn(roomId) {
    let roomName = 'room-' + roomId;
    let room = io.sockets.adapter.rooms[roomName];

    room.minorTurnList.push(room.minorTurnList.shift());

    room.roomSockets.forEach(player => {
        player.emit('yourMinorTurn', room.minorTurnList[0] === player.index)
    })

    let findId = room.playerList.find(player => player.index === room.minorTurnList[0])

    io.sockets.in(roomName).emit('newGuesser', findId)

    console.log(room.minorTurnList)

}

function checkForLetter(roomId, letter) {
    let roomName = 'room-' + roomId;
    let room = io.sockets.adapter.rooms[roomName];

    let score = 0;
    if (room.phrase.includes(letter) || room.phrase.includes(letter.toUpperCase())) {

        for (var i = 0; i < room.phrase.length; i++) {
            if (letter === room.phrase[i] || letter.toUpperCase() === room.phrase[i]) {
                score += 1;
                room.codedPhrase = replaceChar(room.codedPhrase, room.phrase[i], i)
            }
        }
    }
    return { score };
}

function replaceChar(ogString, letter, i) {
    let firstPart = ogString.substr(0, i);
    let lastPart = ogString.substr(i + 1);

    let newString = firstPart + letter + lastPart;
    return newString;
}

function updateScore(roomId, socket, score) {
    let roomName = 'room-' + roomId;
    let room = io.sockets.adapter.rooms[roomName];
    socket.score += score;

    room.playerList.forEach(player => {
        if (player.id === socket.id) {
            player.score = socket.score;
        }
    })

    io.sockets.in(roomName).emit('updateScore', room.playerList);
}

function checkIfTurnOver(roomId) {
    let roomName = 'room-' + roomId;
    let room = io.sockets.adapter.rooms[roomName];
    if (room.failedLetters.length === 6) {
        let turnSocket = room.roomSockets.find(element => element.index === room.currentTurnList[0]);
        updateScore(roomId, turnSocket, 4);
        io.sockets.in(roomName).emit('emitCodedPhrase', room.phrase, false)
        return true;
    } else if (room.codedPhrase === room.phrase) {
        return true
    }
    return false;
}

function endGame(roomId) {
    let roomName = 'room-' + roomId;
    let room = io.sockets.adapter.rooms[roomName];
    room.started = false;

    let sortedData = room.playerList.sort((a, b) => {
        if (a["score"] < b["score"]) {
            return 1
        } else {
            return -1
        }
    })
    console.log(sortedData)

    io.sockets.in(roomName).emit('endGame', sortedData);
}








