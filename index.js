const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
context.font = "bold 16px sans-serif";
const backgroundImg = new Image();
backgroundImg.src = "./assets/images/back.png";
const liftImg = new Image();
liftImg.src = "./assets/images/lift2.png";
const arrowLeftImg = new Image();
arrowLeftImg.src = "./assets/images/arrow_left.png";
const arrowRightImg = new Image();
arrowRightImg.src = "./assets/images/arrow_right.png";
const spritesheetImg = new Image();
spritesheetImg.src = "./assets/images/spritesheet.png";
const closeImg = new Image();
closeImg.src = "";

//BUY
const workerActiveButtonsImg = new Image();
workerActiveButtonsImg.src = "./assets/images/buy.png";
const workerInactiveButtonsImg = new Image();
workerInactiveButtonsImg.src = "./assets/images/buy-inactive.png";
const shaftActiveButtonsImg = new Image();
shaftActiveButtonsImg.src = "./assets/images/buyshaft.png";
const shaftInactiveButtonsImg = new Image();
shaftInactiveButtonsImg.src = "./assets/images/buyshaft-inactive.png";

const shaftHeight = 60,
  shaftWidth = 450,
  liftWidth = 40,
  workerCost = 5,
  max_workers = 100,
  shaftCost = 20,
  max_shafts = 10,
  buttonWidth = 150,
  spriteSize = 60,
  max_frames = 19;
  
let aspectX, aspectY;
let score, shaftsOpen;
let shafts = [];
let frame = 0;
let lift = {
  speed: 0.5,
  arrivedAtShaft: function (shaftNumber) {
    let shaft = shafts[shaftNumber];
    if (shaftNumber > 0) {
      if (shaft.chest > 0) {
        this.chest = this.chest + shaft.chest;
        shaft.chest = 0;
        this.loadingCounter = 100;
      }
    } else {
      if (this.chest > 0) this.loadingCounter = 100;
      shaft.chest = shaft.chest + this.chest;
      this.chest = 0;
    }
  },
  move: function () {
    this.y = this.y + this.speed;
    let currentShaft = this.y / shaftHeight;
    if (currentShaft == Math.floor(currentShaft))
      this.arrivedAtShaft(currentShaft);
    if (this.y >= (shaftsOpen - 1) * shaftHeight || this.y <= 0)
      this.speed = -this.speed;
  },
  update: function () {
    context.drawImage(liftImg, 0, this.y);
    context.fillText(this.chest, 10, this.y + 25);
    if (this.loadingCounter) {
      if (this.y > 0)
        context.drawImage(arrowLeftImg, liftWidth * 0.5, this.y);
      else context.drawImage(arrowRightImg, liftWidth * 0.5, this.y);
      this.loadingCounter--;
    } else {
      this.move();
    }
  },
};
// When creating new Shaft
function Shaft() {
  this.workers = [];
  this.chest = 0;
  this.closed = true;
  this.draw = function (shaftNumber) {
    if (
      shafts[shaftNumber].workers.length < shafts[shaftNumber].max_workers
    )
      if (score >= workerCost)
        context.drawImage(
          workerActiveButtonsImg,
          shaftWidth,
          shaftHeight * shaftNumber
        );
      else
        context.drawImage(
          workerInactiveButtonsImg,
          shaftWidth,
          shaftHeight * shaftNumber
        );
  };
  this.open = function () {
    this.closed = false;
    shaftsOpen++;
    this.workers.push(new Worker());
    score = score - shaftCost;
    
  };
}

function Worker() {
  this.x = Math.floor(Math.random() * liftWidth);
  this.mode = "goRight";
  this.counter = 0;
  this.load = 0;
  this.update = function (shaftNumber) {
    let row;
    switch (this.mode) {
      case "dig":
        this.counter++;
        row = 4;
        console.log(this.counter)
        if (this.counter > 100) {
          this.counter = 0;
          this.mode = "goLeft";
        }
        break;
      case "goRight":
        row = 0;
        this.x++;
        if (
          this.x >=
          shaftWidth - spriteSize * 1.5 + Math.random() * spriteSize
        ) {
          if (shaftNumber > 0) this.mode = "dig";
          else {
            score = score + this.load;
            this.load = 0;
            this.mode = "goLeft";
          }
        }
        break;
      case "goLeft":
        row = 1;
        this.x--;
        if (this.x <= 2 * liftWidth) {
          this.mode = "goRight";
          if (shaftNumber > 0) {
            shafts[shaftNumber].chest = shafts[shaftNumber].chest + 1;
          } else {
            if (shafts[0].chest > 0) {
              this.load = 1;
              shafts[0].chest = shafts[0].chest - 1;
            }
          }
        }
        break;
    }
    if (shaftNumber == 0) {
      row = row + 2;
      if (this.load == 0 && this.mode == "goRight") row = 0;
    }
    context.drawImage(
      spritesheetImg,
      frame * spriteSize,
      row * spriteSize,
      spriteSize,
      spriteSize,
      this.x,
      shaftNumber * shaftHeight,
      spriteSize,
      spriteSize
    );
  };
}

function drawScreen() {
  context.drawImage(
    backgroundImg,
    0,
    0,
    shaftWidth + buttonWidth,
    shaftHeight * shaftsOpen,
    0,
    0,
    shaftWidth + buttonWidth,
    shaftHeight * shaftsOpen
  );
  context.fillText(score, 300, 15);
  shafts.forEach((shaft, shaftNumber) => {
    if (!shaft.closed) {
      context.fillText(
        shaft.chest,
        liftWidth + 15,
        shaftNumber * shaftHeight + 25
      );
      shaft.draw(shaftNumber);
    }
  });
  if (score >= shaftCost)
    context.drawImage(
      shaftActiveButtonsImg,
      shaftWidth,
      shaftHeight * shaftsOpen
    );
  else
    context.drawImage(
      shaftInactiveButtonsImg,
      shaftWidth,
      shaftHeight * shaftsOpen
    );
}

function animate() {
  drawScreen();
  shafts.forEach((shaft, shaftNumber) => {
    shaft.workers.forEach((worker) => {
      worker.update(shaftNumber);
    });
  });
  lift.update();
  frame++;
  if (frame > max_frames) frame = 0;
  window.requestAnimationFrame(animate);
}

function reset() {
  shaftsOpen = 0;
  score = 70;
  lift.y = 0;
  lift.chest = 0;
  lift.loadingCounter = 0;
  shafts.forEach((shaft) => {
    shaft.closed = true;
    shaft.workers = [];
  });
  shafts[0].open();
  shafts[1].open();
  for (let i = shaftsOpen; i < max_shafts; i++) {
    shafts[i].closed = true;
    shafts[i].workers = [];
    context.drawImage(closeImg, 0, i * shaftHeight);
  }
  animate();
}

function resize() {
  let picSizeX = window.innerWidth;
  let picSizeY = window.innerHeight;
  canvas.style.width = window.innerWidth;
  canvas.style.height = window.innerHeight;
  aspectX = picSizeX / 600;
  aspectY = picSizeY / 600;
}

window.onresize = resize;

window.onpointerdown = function (event) {
  let x = event.offsetX / aspectX;
  let y = event.offsetY / aspectY;
  let shaftNumber = Math.floor(y / shaftHeight);
  let shaft = shafts[shaftNumber];
  if (x > shaftWidth)
    if (
      shaftNumber < shaftsOpen &&
      score >= workerCost &&
      shaft.workers.length <= shaft.max_workers
    ) {
      shaft.workers.push(new Worker());
      score = score - workerCost;
    } else {
      if (shaftNumber == shaftsOpen && score >= shaftCost) {
        shaft.open();
      }
    }
};

window.onload = function () {
  for (let i = 0; i < max_shafts; i++) {
    shafts[i] = new Shaft();
    if (i == 0) shafts[i].max_workers = max_workers * 5;
    else shafts[i].max_workers = max_workers;
  }
  reset();
  resize();
};