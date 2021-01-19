var yourTurn = false;
var yourMinorTurn = false;
var guessLetter = 'A';
var failedLetters = [];
let codedPhrase = '';
var waitList = [];
let scoreList = [];
document.getElementById('minorSubmit').disabled = true;

$('#writeNick').focus();
$('#writeNick').on("keyup", function (event) {
    if (event.keyCode === 13) {//on enter key hit, move to next screen
        event.preventDefault();
        nickname = $('#writeNick').val();
        socket.emit('setNickname', nickname)
        $('#first').hide();
        $('#second').show();
        $('#roomCode').focus();
        notTitle();
    }
});
addEventListener('keyup', (event) => {
    if (document.activeElement != guessPhrase && !yourTurn && yourMinorTurn && event.keyCode > 64 && event.keyCode < 91) {
        event.preventDefault();
        guessLetter = String.fromCharCode(event.keyCode);
        $('#guessLetter').text(guessLetter)// display chosen letter in label
    }
})

const socket = io.connect()

$('#createRoom').focus();
$('#createRoom').on("click", ((event) => joinLobby(event, codeGenerate(), 'create')));


$('#roomCode').on("keyup", function (event) {
    if (event.keyCode === 13) {
        joinLobby(event, $('#roomCode').val(), 'join')
    }
});

$('#enterPhrase').on('keyup', (event) => { if (event.keyCode === 13) submitPhrase() });

$('#joinRoom').on("click", (event => joinLobby(event, $('#roomCode').val(), 'join')));

$('#backout1').on('click', event => { //back to title screen
    event.preventDefault();
    $('#second').hide();
    $('#wait').hide();
    $('#first').show();
    yesTitle();
})


$('#backout2').on('click', (event) => { //leave lobby
    event.preventDefault();
    socket.emit('leave game');
    $('#wait').hide();
    $('#second').show();
    $('#displayUsers').text('');
    waitList = [];
    scoreList = [];
})

$('#backout3').on('click', (event) => { //leave game
    event.preventDefault();
    socket.emit('leave game');
    $('#third').hide();
    $('#second').show();
    $('#displayUsers').text('');

    waitList = [];
    scoreList = [];
    endMan();
})

function joinLobby(event, code, type) {
    event.preventDefault();
    roomId = code;
    if (type === 'create') {
        $('#startGame').show();
    } else {
        $('#startGame').hide();

    }

    socket.emit('create', ({ roomId, type }))
}

socket.on('errorMessage', error => {//display errors
    $('#errorMessage').text(error)
})

socket.on('connectedToServer', () => {
    $('#second').hide();
    $('#wait').show();
    $('#displayCode').html(`Waiting in room <b>${roomId}</b>`)
})

socket.on('connectionMade', (data) => {
    $('#displayUsers').append($('<li>').text(data.nickname));
    waitList.push(data)
})

socket.on('gameNowStarting', () => {
    $('#wait').hide();
    $('#third').show();
    startMan();

})
$('#enterPhrase').focus();

socket.on('yourTurn', (turn) => {// turn of type bool

    if (yourTurn != turn) {
        yourTurn = turn;

    }
    //set labels to empty for new turn
    $('#failedLetters').html("");
    failedLetters = [];
    if (turn) {
        $('#notificationBar').text("Your turn to write a Phrase!")
        $('#enterPhrase').prop('disabled', false);//enables use of textbox for your turn

    } else {
        $('#notificationBar').text("Phrase being written right now")
        $('#enterPhrase').prop('disabled', true);// disables use of textbox during others turn
    }
    configureScreen();


});

socket.on('yourMinorTurn', mTurn => {
    if (yourMinorTurn != mTurn) {
        yourMinorTurn = mTurn
    }
    if (mTurn) {
        $('#minorSubmit').prop('disabled', false);
        $('#notificationBar').text("Your turn to Guess a letter or guess the whole phrase!")

    } else if (!yourTurn) {
        $('#minorSubmit').prop('disabled', true);
        $('#notificationBar').text("Not your turn right now.")


    }

    configureScreen();
})

socket.on('emitCodedPhrase', (phrase, newMan) => {
    if (newMan) {
        startMan();
    }
    // series of splits to configure a coded phrase to be displayed
    let tempPhrase = phrase.split(' ').join('%');// adds temp character for a space

    tempPhrase = tempPhrase.split('').join(' ');// adds spaces between all character for better coded display

    tempPhrase = tempPhrase.split(" ' ").join("'")// remove apostrope spacing

    tempPhrase = tempPhrase.split("%").join("&nbsp")// replaces temp character for proper word spacing
    codedPhrase = tempPhrase;
    $('#phraseShow').html(`${codedPhrase}`)
})


socket.on('failedLetters', data => {
    failedLetters.push(data);
    $('#failedLetters').append($('<li>').text(data));
    removeBodyPart();
})

socket.on('updateScore', (playerList) => {
    scoreList = playerList;
    updateScore(scoreList)

})
socket.on('newGuesser', (object) => {
    scoreList.forEach(item => {
        if (object && item.id === object.id) {
            item.guessing = true
        }
        else {
            item.guessing = false
        }

    })
    console.log(scoreList)
    updateScore(scoreList)
})
socket.on('newTurn', (object) => {
    console.log(99)
    scoreList.forEach(item => {
        if (object && item.id === object.id) {
            item.turn = true
        }
        else {
            item.turn = false
        }

    })
    console.log(scoreList)
    updateScore(scoreList)
})


socket.on('removeFromWaitlist', id => {
    waitList = waitList.filter(element => {
        return element.id != id;
    })
    $('#displayUsers').html('');
    waitList.forEach(item => {
        $('#displayUsers').append($('<li>').text(item.nickname));
    })
})

socket.on('notification', data => {
    console.log(data)
    $('#notificationBar').text(data)
})

socket.on('endGame', (data) => {
    $('#phraseShow').html('');
    $('#guessLetter').html('A');
    $('#playerBar').html('');
    $('#prevGameData').html('');
    $('#notificationBar').text("")

    yourTurn = false;
    yourMinorTurn = false;
    guessLetter = 'A';
    failedLetters = [];
    codedPhrase = '';

    $('#enterPhrase').val('');
    $('#guessPhrase').val('');

    data.forEach(item => {
        $('#prevGameData').append($(
            `<div>
            <h5 class="float"> ${item.nickname} <h5>
            <h5 class="float"> ${item.score} <h5>
            </div>`


        ))
    })
    $('#wait').show();
    $('#third').hide();
    endMan();
})

function startGame() {
    socket.emit('startGame');
}

function configureScreen() {
    if (yourTurn) {
        $('#yourTurn').show()
        $('#notYourTurn').hide()
    } else {
        $('#yourTurn').hide()
        $('#notYourTurn').show()
    }
    if (yourMinorTurn) {
        $('#minorSubmit').disabled = false;
    } else {
        $('#minorSubmit').disabled = true;
    }
}
function submitPhrase() {
    let phrase = $('#enterPhrase').val()
    const { isValid, errors } = phraseIsValid(phrase)
    if (isValid) {
        socket.emit('setPhrase', phrase)
        $('#enterPhrase').prop('disabled', true);
        $('#errorTurn').text('');

    } else {
        $('#errorTurn').text(errors[0]);
    }
}

function phraseIsValid(phrase) {
    let errors = []
    let isValid = true;
    if (phrase.length < 5 || phrase.length > 30) {
        errors.push('word/sentence must be between 5 and 30 letters')
    }

    else if (!phrase.match(/^[a-zA-Z-' ]+$/)) {
        errors.push('phrase must only contain letters, hyphens and apostraphees')
    }
    if (errors.length != 0) {
        isValid = false
    }
    return {
        isValid, errors
    }
}

function submitLetter() {
    let tempPhrase = codedPhrase.split('&nbsp').join(' ');
    $('#errorText').hide();
    if (!tempPhrase.includes(guessLetter.toLowerCase()) && !failedLetters.includes(guessLetter.toLowerCase())) {
        yourMinorTurn = false
        socket.emit('guessLetter', guessLetter.toLowerCase())
    } else {
        console.log(codedPhrase)
        $('#errorText').show();
    }

}

function updateScore(playerList) {
    $('#playerBar').html('<h3>Scores<h3>');
    playerList.forEach(element => {
        $('#playerBar').append($(`
        <hr>
        <div class="playerScore ${element.turn ? "dark" : ''}">
            <h5 class="float">${element.nickname}</h5>
            <h5 class="float">${element.score}</h5>
            <h5 class="float">${element.guessing ? "guessing" : ""}</h5>
        
        </div>
        
        `))
    });
}

const guessPhrase = document.getElementById('guessPhrase');

$('#guessPhrase').on("keyup", (event) => {
    console.log('this')
    if (event.keyCode === 13 && yourMinorTurn) {
        if (guessPhrase.value === '') {
            return;
        }
        yourMinorTurn = false
        socket.emit('guessPhrase', guessPhrase.value);
    }

})