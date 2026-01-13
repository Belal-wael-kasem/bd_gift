const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const startBtn = document.getElementById("startBtn");

const box = 30;
const speed = 200;
const WIN_SCORE = 19;
const MAX_SIZE = 140;

// ================= IMAGES =================
const players = [];
for (let i = 1; i <= 5; i++) {
  const img = new Image();
  img.src = `player${i}.png`;
  players.push(img);
}

const foodImg = new Image();
foodImg.src = "food.png";

// ================= GAME STATE =================
let x, y;
let dx = 0;
let dy = 0;
let size = 70;
let food = null;
let score = 0;
let game = null;

// ================= MOVEMENT =================
function setDirection(dir) {
  if (!game) return;

  // FREE movement: allow any direction anytime
  if (dir === "UP")    { dx = 0; dy = -box; }
  if (dir === "DOWN")  { dx = 0; dy = box; }
  if (dir === "LEFT")  { dx = -box; dy = 0; }
  if (dir === "RIGHT") { dx = box; dy = 0; }
}

// ================= KEYBOARD =================
document.addEventListener("keydown", e => {
  if (e.key === "ArrowUp") setDirection("UP");
  if (e.key === "ArrowDown") setDirection("DOWN");
  if (e.key === "ArrowLeft") setDirection("LEFT");
  if (e.key === "ArrowRight") setDirection("RIGHT");
});

// ================= SWIPE CONTROLS =================
let touchStartX = 0;
let touchStartY = 0;
let touchActive = false;

canvas.addEventListener("touchstart", e => {
  const touch = e.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
  touchActive = true;
});

canvas.addEventListener("touchmove", e => {
  if (!touchActive) return;
  e.preventDefault(); // prevent scrolling
  const touch = e.touches[0];
  const dxTouch = touch.clientX - touchStartX;
  const dyTouch = touch.clientY - touchStartY;

  if (Math.abs(dxTouch) < 20 && Math.abs(dyTouch) < 20) return;

  if (Math.abs(dxTouch) > Math.abs(dyTouch)) {
    if (dxTouch > 0) setDirection("RIGHT");
    else setDirection("LEFT");
  } else {
    if (dyTouch > 0) setDirection("DOWN");
    else setDirection("UP");
  }

  touchActive = false; // only one swipe per gesture
});

canvas.addEventListener("touchend", e => {
  touchActive = false;
});

// ================= HELPERS =================
function randomFood() {
  const margin = box * 2;
  const maxX = canvas.width - margin - box;
  const maxY = canvas.height - margin - box;

  return {
    x: Math.floor((Math.random() * (maxX - margin) + margin) / box) * box,
    y: Math.floor((Math.random() * (maxY - margin) + margin) / box) * box
  };
}

function playerImage() {
  if (score === 19) return players[4];
  if (score >= 17) return players[3];
  if (score >= 13) return players[2];
  if (score >= 7)  return players[1];
  return players[0];
}

// ================= GAME LOOP =================
function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw food
  ctx.beginPath();
  ctx.arc(food.x + box / 2, food.y + box / 2, box / 2, 0, Math.PI * 2);
  ctx.fillStyle = "#FFD700";
  ctx.fill();

  if (foodImg.complete && foodImg.naturalWidth) {
    ctx.drawImage(foodImg, food.x, food.y, box, box);
  }

  // Move player
  x += dx;
  y += dy;

  // Wall collision
  if (x < 0 || y < 0 || x + size > canvas.width || y + size > canvas.height) {
    endGame("Game Over! ❌ Press Start to try again");
    return;
  }

  // Draw player image only
  const img = playerImage();
  if (img.complete && img.naturalWidth) {
    ctx.drawImage(img, x, y, size, size);
  }

  // Eat food
  if (
    x < food.x + box &&
    x + size > food.x &&
    y < food.y + box &&
    y + size > food.y
  ) {
    score = Math.min(score + 3, WIN_SCORE);
    size = Math.min(size + 6, MAX_SIZE);
    scoreEl.textContent = "Score: " + score;
    food = randomFood();

    // Vibration on mobile
    if (navigator.vibrate) navigator.vibrate(100);

    if (score >= WIN_SCORE) winGame();
  }
}

// ================= GAME STATES =================
function endGame(message) {
  clearInterval(game);
  game = null;
  startBtn.disabled = false;
  scoreEl.textContent = message;
}

function winGame() {
  clearInterval(game);
  game = null;
  startBtn.disabled = false;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const finalSize = 150;
  const img = players[4];

  if (img.complete && img.naturalWidth) {
    ctx.drawImage(
      img,
      canvas.width / 2 - finalSize / 2,
      canvas.height / 2 - finalSize / 2 - 40,
      finalSize,
      finalSize
    );
  }

  ctx.font = "bold 36px Arial";
  ctx.textAlign = "center";
  ctx.fillStyle = "#FFD700";
  ctx.strokeStyle = "#764ba2";
  ctx.lineWidth = 3;

  ctx.strokeText(
    "❤️ HAPPY BIRTHDAY DODA ❤️",
    canvas.width / 2,
    canvas.height / 2 + finalSize / 2 + 30
  );
  ctx.fillText(
    "❤️ HAPPY BIRTHDAY DODA ❤️",
    canvas.width / 2,
    canvas.height / 2 + finalSize / 2 + 30
  );

  scoreEl.textContent = "Score: " + score + " 🎉 YOU WIN!";
}

// ================= START GAME =================
function startGame() {
  if (game) clearInterval(game);

  size = 70;
  x = canvas.width / 2 - size / 2;
  y = canvas.height / 2 - size / 2;
  dx = 0;
  dy = 0;
  score = 0;

  food = randomFood();
  scoreEl.textContent = "Score: 0";
  startBtn.disabled = true;

  game = setInterval(loop, speed);
}

startBtn.addEventListener("click", startGame);
