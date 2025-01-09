import { Game } from './game.js';
import { ENEMY_CONFIG } from './config.js';

let game = null;

// Admin panel elementlerini seç
const adminPanel = document.getElementById('adminPanel');
const enemySpeedInput = document.getElementById('enemySpeed');
const currentEnemySpeed = document.getElementById('currentEnemySpeed');
const playerDamageInput = document.getElementById('playerDamage');
const currentPlayerDamage = document.getElementById('currentPlayerDamage');
const saveConfigButton = document.getElementById('saveConfig');

// G tuşuna basıldığında admin panelini aç/kapat
document.addEventListener('keydown', (event) => {
    if (event.key === 'g') {
        adminPanel.classList.toggle('hidden');
        
        // Panel açıldığında mevcut değerleri göster
        if (!adminPanel.classList.contains('hidden')) {
            enemySpeedInput.value = ENEMY_CONFIG.BASE_SPEED;
            currentEnemySpeed.textContent = `Mevcut: ${ENEMY_CONFIG.BASE_SPEED}`;
            playerDamageInput.value = game.player.damage;
            currentPlayerDamage.textContent = `Mevcut: ${game.player.damage}`;
        }
    }
});

// Kaydet butonuna tıklanınca
saveConfigButton.addEventListener('click', () => {
    const newEnemySpeed = parseFloat(enemySpeedInput.value);
    const newPlayerDamage = parseFloat(playerDamageInput.value);

    // Düşman hızını güncelle
    ENEMY_CONFIG.BASE_SPEED = newEnemySpeed;
    
    // Oyuncu hasarını güncelle
    if (game && game.player) {
        game.player.damage = newPlayerDamage;
    }

    // Mevcut değerleri güncelle
    currentEnemySpeed.textContent = `Mevcut: ${newEnemySpeed}`;
    currentPlayerDamage.textContent = `Mevcut: ${newPlayerDamage}`;
});

// Local storage'dan high scores'u al
function getHighScores() {
    const scores = localStorage.getItem('highScores');
    return scores ? JSON.parse(scores) : [];
}

// High score'u kaydet
function saveHighScore(nickname, score) {
    let highScores = getHighScores();
    
    // Oyuncunun önceki skoru varsa güncelle, yoksa yeni ekle
    const playerIndex = highScores.findIndex(p => p.nickname === nickname);
    if (playerIndex !== -1) {
        if (score > highScores[playerIndex].score) {
            highScores[playerIndex].score = score;
        }
    } else {
        highScores.push({ nickname, score });
    }
    
    // Skorları sırala
    highScores.sort((a, b) => b.score - a.score);
    
    // Sadece en yüksek 10 skoru tut
    highScores = highScores.slice(0, 10);
    
    // Local storage'a kaydet
    localStorage.setItem('highScores', JSON.stringify(highScores));
    return highScores;
}

// Leaderboard'u güncelle
function updateLeaderboard() {
    const highScores = getHighScores();
    const leaderboardList = document.getElementById('leaderboardList');
    leaderboardList.innerHTML = highScores.map((player, index) => 
        `<li>${index + 1}. ${player.nickname} - ${player.score}</li>`
    ).join('');
}

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    const loginScreen = document.getElementById('loginScreen');
    const nicknameInput = document.getElementById('nicknameInput');
    const startButton = document.getElementById('startButton');
    
    updateLeaderboard();

    startButton.addEventListener('click', () => {
        const nickname = nicknameInput.value.trim();
        if (nickname) {
            // Login ekranını kaldır
            loginScreen.style.display = 'none';
            
            // Oyunu başlat
            game = new Game(nickname);
        }
    });

    // Enter tuşu ile de başlat
    nicknameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            startButton.click();
        }
    });
}); 