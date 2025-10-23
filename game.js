const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const overlay = document.getElementById("overlay");
const restartBtn = document.getElementById("restartBtn");

// ✅ Set canvas fullscreen
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", () => {
  resizeCanvas();
  player.y = canvas.height - player.height - 20;
});

// Variabel game
let score = 0;
let isGameOver = false;
let objects = [];
let facingRight = true;

// Load assets
const imgPlayer = new Image();
imgPlayer.src = "assets/player.png";

const imgPizza = new Image();
imgPizza.src = "assets/pizza.png";

const imgBomb = new Image();
imgBomb.src = "assets/bomb.png";

const bg = new Image();
bg.src = "assets/bg.jpg";

const sndPizza = new Audio("assets/pizza.mp3");
const sndBomb = new Audio("assets/bomb.mp3");

// Player
const player = {
  x: canvas.width / 2 - 40,
  y: canvas.height - 100,
  width: 150,
  height: 150,
  speed: 25,
};

// Spawn objek jatuh
function spawnObject() {
  const isPizza = Math.random() > 0.3; // 70% pizza, 30% bomb
  const size = 100;
  objects.push({
    x: Math.random() * (canvas.width - size),
    y: -size,
    width: size,
    height: size,
    type: isPizza ? "pizza" : "bomb",
    speed: 3 + Math.random() * 4,
  });
}

// Kontrol player
document.addEventListener("keydown", (e) => {
  if (!isGameOver) {
    if (e.key === "ArrowLeft") {
      player.x -= player.speed;
      facingRight = true; // menghadap kiri
    }
    if (e.key === "ArrowRight") {
      player.x += player.speed;
      facingRight = false; // menghadap kanan
    }
  }

  if (player.x < 0) player.x = 0;
  if (player.x + player.width > canvas.width) {
    player.x = canvas.width - player.width;
  }
});

// ✅ Collision bounding box (pizza)
function boxCollision(obj, player) {
  const padding = 20; // perkecil hitbox tikus biar lebih pas
  return (
    obj.x < player.x + player.width - padding &&
    obj.x + obj.width > player.x + padding &&
    obj.y < player.y + player.height - padding &&
    obj.y + obj.height > player.y + padding
  );
}

// ✅ Collision lingkaran (bomb)
function circleCollision(obj, player) {
  const objCenterX = obj.x + obj.width / 2;
  const objCenterY = obj.y + obj.height / 2 - 40;
  const playerCenterX = player.x + player.width / 2;
  const playerCenterY = player.y + player.height / 2;

  const dx = objCenterX - playerCenterX;
  const dy = objCenterY - playerCenterY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  const radiusSum = obj.width / 2 + player.width / 3; // hitbox tikus diperkecil
  return distance < radiusSum;
}

// Update logika game
function update() {
  if (isGameOver) return;

  objects.forEach((obj) => {
    obj.y += obj.speed;

    if (obj.type === "pizza") {
      if (boxCollision(obj, player)) {
        score++;
        sndPizza.play();
        objects = objects.filter((o) => o !== obj);
      }
    } else if (obj.type === "bomb") {
      if (circleCollision(obj, player)) {
        sndBomb.play();
        isGameOver = true;
        showGameOver();
      }
    }
    document.getElementById("scoreBoard").innerText = "Score: " + score;
  });

  objects = objects.filter((obj) => obj.y < canvas.height + 50);
}

// Gambar
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Gambar background
  if (bg.complete) {
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
  }

  // ✅ Gambar player sesuai arah
  // ✅ Gambar player sesuai arah
  ctx.save();
  if (facingRight) {
    ctx.drawImage(imgPlayer, player.x, player.y, player.width, player.height);
  } else {
    // geser origin biar flip pas
    ctx.translate(player.x + player.width, player.y);
    ctx.scale(-1, 1);
    ctx.drawImage(imgPlayer, 0, 0, player.width, player.height);
  }
  ctx.restore();

  // Gambar objek jatuh
  objects.forEach((obj) => {
    if (obj.type === "pizza") {
      ctx.drawImage(imgPizza, obj.x, obj.y, obj.width, obj.height);
    } else {
      ctx.drawImage(imgBomb, obj.x, obj.y, obj.width, obj.height);
    }
  });

  // Score
  ctx.fillStyle = "white";
  ctx.font = "24px Arial";
}

// ✅ Overlay Game Over
function showGameOver() {
  overlay.classList.add("show");
}

// Game loop
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// Spawn objek tiap 1 detik
let spawnInterval = setInterval(spawnObject, 1000);

// Restart Game
restartBtn.addEventListener("click", () => {
  score = 0;
  isGameOver = false;
  objects = [];
  player.x = canvas.width / 2 - player.width / 2;
  player.y = canvas.height - player.height - 20;

  document.getElementById("scoreBoard").innerText = "Score: 0";
  overlay.classList.remove("show");

  // ✅ restart musik
  bgMusic.currentTime = 0;
  bgMusic.play();
});

// Background music
const bgMusic = new Audio("assets/music.mp3");
bgMusic.loop = true; // biar terus berulang
bgMusic.volume = 0.3; // atur volume (0.0 - 1.0)

window.addEventListener("load", () => {
  bgMusic.play().catch(() => {
    console.log("Musik butuh interaksi user dulu");
  });
});

gameLoop();
