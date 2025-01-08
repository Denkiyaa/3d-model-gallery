import { Game } from './game.js';
import { ENEMY_CONFIG } from './config.js';

// Oyunu başlat
window.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});

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
            playerDamageInput.value = window.game.player.damage;
            currentPlayerDamage.textContent = `Mevcut: ${window.game.player.damage}`;
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
    if (window.game && window.game.player) {
        window.game.player.damage = newPlayerDamage;
    }

    // Mevcut değerleri güncelle
    currentEnemySpeed.textContent = `Mevcut: ${newEnemySpeed}`;
    currentPlayerDamage.textContent = `Mevcut: ${newPlayerDamage}`;
}); 