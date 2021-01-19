class asteroid {
    constructor(sw, sh) {
        this.sw = sw;
        this.sh = sh;
        this.dia = Math.random() * 25 + 10;
        this.speed = Math.random() * 6 + 1;
        this.ang = 0;
        this.pos = { x: 0, y: 0 };
        this.vector = { x: 0, y: 0 };
    }

    start() {
        var ran = Math.ceil(Math.random() * 4);
        //console.log(ran);
        if (ran == 1) {
            this.pos.y = 0 - 20;
            this.pos.x = (Math.random() * this.sw * 2 / 4) + this.sw / 4;
            this.ang = (Math.random() * 90) + 225;
        }
        else if (ran == 2) {
            this.pos.x = this.sw + 20;
            this.pos.y = (Math.random() * this.sh * 2 / 4) + this.sh / 4;
            this.ang = (Math.random() * 90) + 135;
        }
        else if (ran == 3) {
            this.pos.y = this.sh + 20;
            this.pos.x = this.pos.x = (Math.random() * this.sw * 2 / 4) + this.sw / 4;
            this.ang = (Math.random() * 90) + 45;

        }
        else if (ran == 4) {
            this.pos.x = 0 - 20;
            this.pos.y = (Math.random() * this.sh * 2 / 4) + this.sh / 4;
            this.ang = (Math.random() * 90) + 315;
            if (this.ang >= 360) {
                this.ang -= 360;
            }
        }

        if (this.ang >= 0 && this.ang < 90) {
            this.vector.x = Math.cos(this.ang * (Math.PI / 180));
            this.vector.y = -Math.sin(this.ang * (Math.PI / 180));
        }
        else if (this.ang >= 90 && this.ang < 180) {
            this.vector.x = -Math.cos((180 - this.ang) * (Math.PI / 180));
            this.vector.y = -Math.sin((180 - this.ang) * (Math.PI / 180));
        }
        else if (this.ang >= 180 && this.ang < 270) {
            this.vector.x = -Math.cos((this.ang - 180) * (Math.PI / 180));
            this.vector.y = Math.sin((this.ang - 180) * (Math.PI / 180));
        }
        else if (this.ang >= 270 && this.ang < 360) {
            this.vector.x = Math.cos((360 - this.ang) * (Math.PI / 180));
            this.vector.y = Math.sin((360 - this.ang) * (Math.PI / 180));

        }

    }

    update() {
        this.pos.x += this.vector.x * this.speed;
        this.pos.y += this.vector.y * this.speed;
    }

    draw() {
        strokeWeight(0);
        fill('#f28546');
        ellipse(this.pos.x, this.pos.y, this.dia, this.dia);

    }

}