import { GAME_CONFIG } from './config.js';
import { Enemy } from './Enemy.js';

// Wave yönetimi
export class WaveManager {
    constructor(game) {
        this.game = game;
        this.currentWave = GAME_CONFIG.INITIAL_WAVE;
        this.enemiesRemaining = this.calculateEnemyCount();
        this.isSpawning = true;
        
        this.waveStatus = document.getElementById('waveStatus');
        this.updateWaveDisplay();
        this.spawnEnemy();
    }

    calculateEnemyCount() {
        const isBossWave = this.currentWave % 5 === 0;
        if (isBossWave) {
            return 1; // Boss wave'de sadece 1 düşman
        }
        
        // Her boss wave sonrası düşman sayısı artar
        const bossWavesPassed = Math.floor((this.currentWave - 1) / 5);
        const baseEnemyCount = 5;
        const enemyIncrease = bossWavesPassed * 2; // Her boss sonrası 2 düşman daha
        
        return baseEnemyCount + enemyIncrease;
    }

    calculateDifficulty() {
        // Her boss wave sonrası zorluk artar
        const bossWavesPassed = Math.floor((this.currentWave - 1) / 5);
        
        // Hız artışı (her boss sonrası %20, maksimum %100)
        const speedMultiplier = 1 + Math.min(1, bossWavesPassed * 0.2);
        
        console.log('Difficulty calculation:', {
            wave: this.currentWave,
            bossWavesPassed,
            speedMultiplier
        });
        
        return {
            speed: speedMultiplier,
            health: 1 + Math.min(2, bossWavesPassed * 0.3)
        };
    }

    updateWaveDisplay() {
        this.waveStatus.textContent = `Wave ${this.currentWave}`;
        
        // Boss wave kontrolü ve yazı gösterimi
        if (this.currentWave % 5 === 0) {
            const bossText = document.createElement('div');
            bossText.className = 'boss-wave-text';
            bossText.textContent = 'BOSS WAVE!';
            bossText.style.cssText = `
                position: fixed;
                top: 20%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 48px;
                font-weight: bold;
                color: #FFD700;
                text-shadow: 0 0 10px #FF0000;
                animation: bossTextAppear 0.5s ease-out;
                z-index: 1000;
            `;
            document.body.appendChild(bossText);

            // CSS animasyonları
            const style = document.createElement('style');
            style.textContent = `
                @keyframes bossTextAppear {
                    from { transform: translate(-50%, -50%) scale(0); opacity: 0; }
                    to { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                }
                @keyframes bossTextFade {
                    to { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
                }
                .boss-wave-text.fade-out {
                    animation: bossTextFade 0.5s ease-out forwards;
                }
            `;
            document.head.appendChild(style);

            // 1.5 saniye sonra yazıyı kaldır
            setTimeout(() => {
                bossText.classList.add('fade-out');
                setTimeout(() => {
                    bossText.remove();
                    style.remove();
                }, 500);
            }, 1500);
        }
    }

    startNewWave() {
        if (this.currentWave < 100) {
            this.currentWave++;
            this.enemiesRemaining = this.calculateEnemyCount();
            this.isSpawning = true;
            this.updateWaveDisplay();
            this.spawnEnemy();
        }
    }

    spawnEnemy() {
        if (this.enemiesRemaining <= 0) {
            this.isSpawning = false;
            return;
        }
        
        const enemy = new Enemy(this.game.canvas, this.currentWave);
        const difficulty = this.calculateDifficulty();
        
        console.log('Before difficulty multiplier - Enemy Speed:', enemy.speedX);
        
        if (this.currentWave % 5 === 0) {
            // Boss özellikleri Enemy sınıfında ayarlanıyor
            this.enemiesRemaining = 0;
        } else {
            // Normal düşmanların hızını ve canını artır
            const oldSpeed = enemy.speedX;
            enemy.speedX *= difficulty.speed;
            console.log('After difficulty multiplier:', {
                oldSpeed,
                difficultySpeed: difficulty.speed,
                newSpeed: enemy.speedX
            });
            enemy.health *= difficulty.health;
            enemy.maxHealth = enemy.health;
        }
        
        this.game.enemies.push(enemy);
        this.enemiesRemaining--;
        
        if (this.enemiesRemaining > 0) {
            setTimeout(() => this.spawnEnemy(), GAME_CONFIG.SPAWN_DELAY);
        } else {
            this.isSpawning = false;
        }
    }
} 