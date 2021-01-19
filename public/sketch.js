
let titleScreen = true;
let inGame = false;
let asteroids = [];
let counter = 0;
let offset = 0;
let notBlurred = true;


window.onblur = () => {
    notBlurred = false
}
window.onfocus = () => {
    notBlurred = true
}

let astroStart = [0, 1, 2, 3, 4, 5]
let astroGame = [0, 1, 2, 3, 4, 5]

function setup() {

    canv = createCanvas(windowWidth, windowHeight);
    canv.parent('sketchParent')
}

function draw() { //runs on each new frame
    counter += 0.001;
    if (counter === 360) {
        counter = 0
    }
    offset = 20 * Math.sin(counter * 180 / Math.PI);
    background('#040836');



    if (titleScreen) {
        planet()
        ring(7, '#700808')
        ring(0, 'red')
        title();
    }
    asteroids.forEach(ast => {
        ast.update();
        ast.draw();
    })
    if (titleScreen) {
        astronaut(offset, astroStart);
    }

    if (inGame) {
        astronaut(offset, astroGame)
    }

}

function notTitle() {
    titleScreen = false;
}
function yesTitle() {
    titleScreen = true
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function ring(offset, colour) {
    let cos30 = Math.cos(Math.PI / 6);
    let sin30 = Math.sin(Math.PI / 6)
    let radius = 300;
    let middleX = windowWidth / 2 + offset;
    let middleY = windowHeight / 7 * 3 - offset;
    strokeWeight(30);
    stroke(colour)
    line(middleX, middleY - radius, middleX + radius * cos30, middleY - radius * sin30)
    line(middleX + radius * cos30, middleY - radius * sin30, middleX + radius * cos30, middleY + radius * sin30)
    line(middleX + radius * cos30, middleY + radius * sin30, middleX, middleY + radius)
    line(middleX, middleY + radius, middleX - radius * cos30, middleY + radius * sin30)
    line(middleX - radius * cos30, middleY + radius * sin30, middleX - radius * cos30, middleY - radius * sin30)
    line(middleX - radius * cos30, middleY - radius * sin30, middleX, middleY - radius)


}
function title() {
    textSize(80);
    textAlign(CENTER);
    fill(255);
    stroke('grey')
    strokeWeight(3);
    text("DEADMAN", windowWidth / 2, windowHeight / 4)
}

function astronaut(offset, list) {
    let midX = windowWidth / 2;
    let midY = windowHeight / 2;
    if (list.includes(5)) {
        lLeg(midX - 40 + offset / 5, midY + 10 + offset);
    }
    if (list.includes(4)) {
        rLeg(midX + 40 + offset / 5, midY + 10 + offset);
    }
    if (list.includes(3)) {
        rArm(midX + 25 + offset / 5, midY - 75 + offset);
    }
    if (list.includes(2)) {
        lArm(midX - 25 + offset / 5, midY - 100 + offset);
    }
    if (list.includes(1)) {
        body(midX + offset / 5, midY - 60 + offset);
    }
    if (list.includes(0)) {
        head(midX + offset / 5, midY - 160 + offset);
    }

}


function head(x, y) {
    fill(200);
    stroke(0);
    strokeWeight(2);
    ellipse(x, y, 120, 80)

    strokeWeight(0.5);
    fill(0);
    stroke(0);


    ellipse(x - 15, y - 10, 10, 15)
    ellipse(x + 15, y - 10, 10, 15)
    line(x - 10, y + 10, x + 10, y + 10)

    strokeWeight(0);
    stroke(0);
    fill(0, 100, 200, 70)
    ellipse(x, y, 90, 50)
}

function body(x, y) {
    fill(200);
    stroke(0);
    strokeWeight(2);

    ellipse(x, y, 110, 220)
    line(x, y + 110, x, y - 110)
}

function rArm(x, y) {
    fill(200);
    stroke(0);
    strokeWeight(2);
    beginShape();
    vertex(x, y);
    bezierVertex(x, y, x + 75, y + 50, x + 150, y - 75)
    bezierVertex(x + 150, y - 75, x + 170, y - 100, x + 140, y - 100, x + 125, y - 90)

    bezierVertex(x + 125, y - 90, x + 75, y + 20, x, y - 40)
    endShape(CLOSE);
    line(x + 150, y - 75, x + 125, y - 90)
}
function lArm(x, y) {
    fill(200);
    stroke(0);
    strokeWeight(2);
    beginShape();
    vertex(x, y);
    bezierVertex(x, y, x - 75, y - 50, x - 150, y + 75)
    bezierVertex(x - 150, y + 75, x - 170, y + 100, x - 140, y + 100, x - 125, y + 90)

    bezierVertex(x - 125, y + 90, x - 75, y - 20, x, y + 40)
    endShape(CLOSE);
    line(x - 150, y + 75, x - 125, y + 90)
}
function lLeg(x, y) {
    fill(200);
    stroke(0);
    strokeWeight(2);
    beginShape();
    vertex(x, y);
    bezierVertex(x, y, x - 75, y + 50, x, y + 150)
    bezierVertex(x, y + 150, x + 10, y + 170, x + 30, y + 130)


    bezierVertex(x + 30, y + 130, x - 55, y + 50, x + 40, y)
    endShape(CLOSE);

}
function rLeg(x, y) {
    fill(200);
    stroke(0);
    strokeWeight(2);
    beginShape();
    vertex(x, y);
    bezierVertex(x, y, x + 75, y + 50, x, y + 150)
    bezierVertex(x, y + 150, x - 10, y + 170, x - 30, y + 130)


    bezierVertex(x - 30, y + 130, x + 55, y + 50, x - 40, y)
    endShape(CLOSE);
}

function planet() {
    fill('#00b4cc')
    strokeWeight(2)
    stroke(0);

    ellipse(windowWidth - 20, -10, 400, 400);

}

function startMan() {
    astroGame = [0, 1, 2, 3, 4, 5];
    inGame = true;
}
function endMan() {
    inGame = false;
}

function removeBodyPart() {
    astroGame.pop();
}
// removed vortex code
// function vortex() {
//     fill(0);

//     ellipse(windowWidth / 8, windowHeight / 7 * 3, 120, 520);




//     fill('#1c0063')

//     ellipse(windowWidth / 8, windowHeight / 7 * 3, 100, 500);

//     fill('#0f0036')

//     ellipse(windowWidth / 8, windowHeight / 7 * 3, 60, 300);

//     fill('#1c0063')

//     ellipse(windowWidth / 8, windowHeight / 7 * 3, 40, 200);
// }

// function drawVortexShadow() {
//     strokeWeight(0);
//     // beginShape()
//     // vertex(windowWidth / 8, windowHeight / 7 * 3 - 260)
//     // vertex(windowWidth / 4, 80)
//     // vertex(windowWidth / 4, windowHeight / 7 * 6 - 80)
//     // vertex(windowWidth / 8, windowHeight / 7 * 3 + 260)
//     // // line(windowWidth / 8, windowHeight / 7 * 3 - 260, windowWidth / 4, 80)
//     // // line(windowWidth / 4, 80, windowWidth / 4, windowHeight / 7 * 6 - 80)
//     // // line(windowWidth / 8, windowHeight / 7 * 3 + 260, windowWidth / 4, windowHeight / 7 * 6 - 80)
//     // endShape(CLOSE)
//     for (var i = 0; i < 100; i++) {
//         //fill(15, 0, 54, 100 - i);
//         //colorMode(RGB);
//         let from = color(0);
//         let to = color(4, 8, 54);
//         let inter = lerpColor(from, to, i / 100)
//         fill(inter)
//         rect(windowWidth / 8 + i * 2, windowHeight / 7 * 3 - 260, i * 2 + 2, 520)
//     }
//     //rect(windowWidth / 8, windowHeight / 7 * 3 - 260, 200, 520)
// }

setInterval(() => {
    for (var i = 0; i < asteroids.length; i++) {
        if (asteroids[i].pos.x < 0 - 100 || asteroids[i].pos.y < 0 - 100 || asteroids[i].pos.x > windowWidth + 100 || asteroids[i].pos.y > windowHeight + 100) {
            asteroids.splice(i, 1);
        }
    }
}, 1000)

setInterval(() => {
    if (notBlurred) {
        let ast = new asteroid(windowWidth, windowHeight);
        ast.start();
        asteroids.push(ast);
    }

}, 1000)
