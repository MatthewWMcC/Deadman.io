function codeGenerate() {
    let code = ''
    for (var i = 0; i < 4; i++) {
        var element = randAscii()
        code = code + element
    }
    //return 'aaaa';
    return code;
}

function randAscii() {
    var num = Math.floor(Math.random() * 43) + 48
    return (num > 57 && num < 65) ? randAscii() : String.fromCharCode(num)
}