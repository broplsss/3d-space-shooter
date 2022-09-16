
layers([
    "bg",
    "obj",
    "ui",
], "obj");


const SCREEN_WIDTH = 320;
const SCREEN_HEIGHT = 200;
const ALIEN_SPEED = 200;


let aliens = [];

function spawnAlien(){
    const x = rand(0 , SCREEN_WIDTH);
    const y = rand(0 , SCREEN_HEIGHT);

    var newAlien = add([
        sprite("alien"),
        pos(x,y),
        scale(0.2),
        rotate(0),
        {
            xpos: rand(-1*SCREEN_WIDTH/2, SCREEN_WIDTH/2),
            ypos: rand(-1*SCREEN_HEIGHT/2, SCREEN_HEIGHT/2),
            zpos: 1000,
            speed: ALIEN_SPEED + rand(-0.5* ALIEN_SPEED, 0.5*ALIEN_SPEED)
        },
        "alien"
    ]);

    aliens.push(newAlien);
}

loop(0.8, spawnAlien);


action("alien", (alien)=>{
    alien.zpos -= alien.speed * dt();

    alien.scale = 2 - (alien.zpos * 0.002);

    const centerX = SCREEN_WIDTH * 0.5;
    const centerY = SCREEN_HEIGHT *0.25;

    alien.pos.x  = centerX + alien.xpos * (alien.zpos * 0.001);
    alien.pos.y = centerY + alien.ypos * (alien.zpos * 0.001);

    // if (alien.zpos <= 1 ){
    //     destroyAlien(alien);
    // }
    if (alien.zpos < 1 ){
         //check if the alien has hit the craft
         if (alien.pos.x >= STRIKE_ZONE.x1 &&
             alien.pos.x <= STRIKE_ZONE.x2 &&
             alien.pos.y >= STRIKE_ZONE.y1 &&
             alien.pos.y <= STRIKE_ZONE.y2){
                 camShake(20);
                 makeExplosion(alien.pos, 10, 10, 10);
         }
         destroyAlien(alien);
    }


});

function destroyAlien(alien){
    aliens = aliens.filter(a => a != alien);
    destroy(alien);
}


const STAR_COUNT = 1000;
const STAR_SPEED = 5;
var stars = [];

function spawnStars(){
    for (let i = 0; i < STAR_COUNT; i++) {
        const newStar = {
          xpos: rand(-0.5*SCREEN_WIDTH, 0.5*SCREEN_WIDTH),
          ypos: rand(-0.5*SCREEN_HEIGHT, 0.5*SCREEN_HEIGHT),
          zpos: rand(1000)
        };
        stars.push(newStar);
    }
}

spawnStars();

action(()=>{
  const centerX = SCREEN_WIDTH * 0.5;
  const centerY = SCREEN_HEIGHT * 0.5;

  stars.forEach((star)=>{
    star.zpos -= STAR_SPEED;
    if (star.zpos <=1)
    {
      star.zpos = 1000;
    }
    const x = centerX + star.xpos / (star.zpos * 0.001);
    const y = centerY + star.ypos / (star.zpos * 0.001);

    if (x>= 0 && x<= SCREEN_WIDTH && y>=0 && y<= SCREEN_HEIGHT) {
      const scaled_z = star.zpos * 0.0005;
      const intensity = 1 - scaled_z;

      drawRect(vec2(x,y), 1, 1, {
        color: rgb(intensity, intensity, intensity)
      });
    }
  })
});


const cockpit = add([
    sprite("cockpit"),
    layer("ui"),
    rotate(0),
    pos(SCREEN_WIDTH/2, SCREEN_HEIGHT/2 ),
    origin("center"),
    scale(0.275)
]);

function shiftAliens(x, y){
    aliens.forEach((alien) =>{
        alien.xpos += x / (alien.zpos*0.01);
        alien.ypos += y / (alien.zpos*0.01);
    });
}

function shiftStars(x, y){
    stars.forEach(star =>{
        star.xpos += x *0.01;
        star.ypos += y *0.01;
    });
}


const MOVE_DELTA = 2000;

keyDown("left", () => {
    const delta =  MOVE_DELTA * dt();
    shiftAliens(delta, 0);
    shiftStars(delta*0.01, 0);
    camRot(0.1);
});

keyDown("right", () => {
    const delta =  -1 * MOVE_DELTA * dt();
    shiftAliens(delta, 0);
    shiftStars(delta*0.01, 0);
    camRot(-0.1);
});


keyDown("up", () => {
    const delta =  -1 * MOVE_DELTA * dt();
    shiftAliens(0, delta);
    shiftStars(0,delta*0.01);
});

keyDown("down", () => {
    const delta = MOVE_DELTA * dt();
    shiftAliens(0, delta);
    shiftStars(0, delta*0.01);
});

keyRelease("left", ()=>{
    camRot(0);
});

keyRelease("right", ()=>{
    camRot(0);
});

const vertical_crosshair = add([
    rect(1, 10),
    origin('center'),
    pos(SCREEN_WIDTH*0.5, SCREEN_HEIGHT*0.33),
    color(0, 1, 1),
    layer("ui")
]);

const horizontal_crosshair = add([
    rect(10, 1),
    origin('center'),
    pos(SCREEN_WIDTH*0.5, SCREEN_HEIGHT*0.33),
    color(0, 1, 1),
    layer("ui")
]);


const BULLET_SPEED = 10;
function spawnBullet() {

    const BULLET_ORIGIN_LEFT = vec2(SCREEN_WIDTH *0.25, (SCREEN_HEIGHT - SCREEN_HEIGHT*0.33));
    const BULLET_ORIGIN_RIGHT = vec2(SCREEN_WIDTH - (SCREEN_WIDTH*0.25), (SCREEN_HEIGHT - SCREEN_HEIGHT*0.33));

    const BULLET_VANISHING_POINT = vec2(SCREEN_WIDTH * 0.5, SCREEN_HEIGHT *0.33);

    add([
        rect(1, 1),
        pos(BULLET_ORIGIN_LEFT),
        color(1, 0, 0),
        "bullet",
        {
            bulletSpeed:  BULLET_SPEED ,
            targetPos: BULLET_VANISHING_POINT
        }
    ]);

    add([
        rect(1, 1),
        pos(BULLET_ORIGIN_RIGHT),
        color(1, 0, 0),
        "bullet",
        {
            bulletSpeed:  -1*BULLET_SPEED,
            targetPos: BULLET_VANISHING_POINT
        }
    ]);

    play("shoot", {
        volume: 0.2,
        detune: rand(-1200, 1200),
    });
}


action("bullet", (b) => {

    const m = (b.pos.y - b.targetPos.y) / (b.pos.x - b.targetPos.x);
    const c = b.targetPos.y - m*(b.targetPos.x);

    let newX = b.pos.x + b.bulletSpeed;
    let newY = m * newX + c;
    b.pos.x = newX
    b.pos.y = newY;
    // Remove the bullet once it has hit the vanishing point y line
    if ((b.pos.y < SCREEN_HEIGHT*0.33)) {
        destroy(b);
    }
});

keyDown("space", () => {
    spawnBullet();
});

const BULLET_SLACK = 10;
collides("alien","bullet", (alien, bullet) =>{
    if (bullet.pos.y > SCREEN_HEIGHT*0.33 + BULLET_SLACK) return;
    makeExplosion(bullet.pos, 5, 5, 5);
    destroy(alien);
    destroy(bullet);
});


function makeExplosion(p, n, rad, size) {
        for (let i = 0; i < n; i++) {
            wait(rand(n * 0.1), () => {
                for (let i = 0; i < 2; i++) {
                    add([
                        pos(p.add(rand(vec2(-rad), vec2(rad)))),
                        rect(1, 1),
                        scale(1 * size, 1 * size),
                        lifespan(0.1),
                        grow(rand(48, 72) * size),
                        origin("center"),
                    ]);
                }
            });
        }
}

function lifespan(time) {
        let timer = 0;
        return {
            update() {
                timer += dt();
                if (timer >= time) {
                    destroy(this);
                }
            },
        }
}

function grow(rate) {
    return {
        update() {
            const n = rate * dt();
            this.scale.x += n;
            this.scale.y += n;
        },
    };
}


const STRIKE_ZONE = {x1:80, x2:240, y1:20, y2:100};