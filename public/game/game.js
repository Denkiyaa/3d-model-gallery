// Complete game.js logic

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const livesDisplay = document.getElementById('lives');
const goldDisplay = document.getElementById('gold');
const waveStatus = document.getElementById('wave-status');
const damageCostDisplay = document.getElementById('damage-cost');
const speedCostDisplay = document.getElementById('speed-cost');

function resizeCanvas() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspect = 16 / 9;

    if (width / height > aspect) {
        canvas.width = height * aspect;
        canvas.height = height;
    } else {
        canvas.width = width;
        canvas.height = width / aspect;
    }
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

let score = 0;
let lives = 5;
let gold = 0;
let enemies = [];
let damage = 1;
let attackSpeed = 1000;
let wave = 1;
let enemiesRemaining = 5;
let spawningEnemies = true;

let damageCost = 3;
let speedCost = 5;

const groundImage = new Image();
groundImage.src = '/game/ground_pattern.png';

const castleImage = new Image();
castleImage.src = '/game/castle.png';

const enemyImage = new Image();
enemyImage.src = '/game/enemy.png';

const player = {
    x: 150,
    y: canvas.height / 2 - 50,
    width: 50,
    height: 50,
    color: '#000',
    lastAttackTime: 0
};

const arrows = [];

function drawGround() {
    const pattern = ctx.createPattern(groundImage, 'repeat');
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawCastle() {
    ctx.drawImage(castleImage, 0, canvas.height * 0.5 - 150, 150, 300);
}

function drawPlayer() {
    ctx.save();
    ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
    ctx.fillStyle = player.color;
    ctx.fillRect(-player.width / 2, -player.height / 2, player.width, player.height);
    ctx.restore();
}

function drawArrows() {
    arrows.forEach((arrow, index) => {
        if (arrow.target.health <= 0) {
            arrows.splice(index, 1);
            return;
        }

        const dx = arrow.target.x + arrow.target.width / 2 - arrow.x;
        const dy = arrow.target.y + arrow.target.height / 2 - arrow.y;
        const angle = Math.atan2(dy, dx);

        arrow.x += arrow.speed * Math.cos(angle);
        arrow.y += arrow.speed * Math.sin(angle);

        ctx.save();
        ctx.translate(arrow.x, arrow.y);
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(-5, -2, 10, 4);
        ctx.restore();

        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 10) {
            arrow.target.health -= damage;
            arrows.splice(index, 1);

            if (arrow.target.health <= 0) {
                const targetIndex = enemies.indexOf(arrow.target);
                if (targetIndex > -1) {
                    enemies.splice(targetIndex, 1);
                    score++;
                    gold += 10;
                    scoreDisplay.textContent = score;
                    goldDisplay.textContent = gold;
                }
            }
        }
    });
}

function spawnEnemy() {
    if (spawningEnemies) {
        const isBoss = wave === 5 && enemiesRemaining === 1; // Spawn boss on wave 5
        enemies.push({
            x: canvas.width - 50,
            y: Math.random() * canvas.height,
            width: isBoss ? 100 : 50,
            height: isBoss ? 100 : 50,
            speedX: isBoss ? -1.5 : -2 - wave * 0.5,
            health: isBoss ? 50 : 3 + wave, // Adjust health for boss
        });
        enemiesRemaining--;
        if (enemiesRemaining <= 0) spawningEnemies = false;
    }
}

function drawEnemies() {
    enemies.forEach((enemy, index) => {
        enemy.x += enemy.speedX;
        ctx.drawImage(enemyImage, enemy.x, enemy.y, enemy.width, enemy.height);

        // Health bar
        ctx.fillStyle = 'red';
        ctx.fillRect(enemy.x, enemy.y - 10, enemy.width, 5);
        ctx.fillStyle = 'green';
        ctx.fillRect(enemy.x, enemy.y - 10, (enemy.health / (enemy.width === 100 ? 50 : 3 + wave)) * enemy.width, 5);

        if (enemy.x < 0) {
            enemies.splice(index, 1);
            lives--;
            livesDisplay.textContent = lives;

            if (lives <= 0) {
                gameOver();
            }
        }
    });

    if (enemies.length === 0 && !spawningEnemies) {
        wave++;
        enemiesRemaining = 5 + wave * 2;
        spawningEnemies = true;
        waveStatus.textContent = `Wave ${wave}`;
    }
}

function autoAttack() {
    const currentTime = Date.now();
    if (currentTime - player.lastAttackTime >= attackSpeed) {
        if (enemies.length > 0) {
            const target = enemies.find(enemy => enemy.health > 0); // Target only alive enemies
            if (target) {
                arrows.push({
                    x: player.x + player.width,
                    y: player.y + player.height / 2 - 2,
                    speed: 10,
                    target: target
                });
                player.lastAttackTime = currentTime;
            }
        }
    }
}

function upgrade(attribute) {
    if (attribute === 'damage' && gold >= damageCost) {
        damage += 2;
        gold -= damageCost;
        damageCost += 2; // Increase cost after each upgrade
        goldDisplay.textContent = gold;
        damageCostDisplay.textContent = damageCost;
    } else if (attribute === 'attackSpeed' && gold >= speedCost) {
        attackSpeed = Math.max(200, attackSpeed - 100);
        gold -= speedCost;
        speedCost += 3; // Increase cost after each upgrade
        goldDisplay.textContent = gold;
        speedCostDisplay.textContent = speedCost;
    }
}

function gameOver() {
    alert('Game Over! Your Score: ' + score);
    document.location.reload();
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGround();
    drawCastle();
    drawPlayer();
    drawArrows();
    drawEnemies();
    autoAttack();
    requestAnimationFrame(gameLoop);
}

setInterval(spawnEnemy, 1000);
gameLoop();
