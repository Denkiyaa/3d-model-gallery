import { GAME_CONFIG } from './config.js';
import { Enemy } from './Enemy.js';

// Wave yönetimi
export class WaveManager {
    constructor(game) {
        this.game = game;
        this.currentWave = GAME_CONFIG.INITIAL_WAVE;
        this.enemiesRemaining = this.calculateEnemyCount();
        this.isSpawning = true;
        
        console.log('WaveManager initialized:', {
            currentWave: this.currentWave,
            enemiesRemaining: this.enemiesRemaining,
            isSpawning: this.isSpawning
        });
        
        this.waveStatus = document.getElementById('waveStatus');
        this.updateWaveDisplay();
        this.spawnEnemy();
    }

    calculateEnemyCount() {
        const isBossWave = this.currentWave % 5 === 0;
        const enemyCount = isBossWave ? 1 : 
            GAME_CONFIG.WAVE.INITIAL_ENEMIES + 
            Math.floor((this.currentWave - 1) / 5) * GAME_CONFIG.WAVE.ENEMIES_INCREMENT;
        
        console.log('Calculated enemy count:', {
            wave: this.currentWave,
            isBossWave,
            enemyCount
        });
        
        return enemyCount;
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
        console.log('Attempting to spawn enemy:', {
            enemiesRemaining: this.enemiesRemaining,
            isSpawning: this.isSpawning,
            currentWave: this.currentWave
        });

        if (this.enemiesRemaining <= 0) {
            console.log('No enemies remaining, stopping spawn');
            this.isSpawning = false;
            return;
        }
        
        const enemy = new Enemy(this.game.canvas, this.currentWave);
        const difficulty = this.calculateDifficulty();
        
        if (this.currentWave % 5 === 0) {
            console.log('Spawning boss');
            this.enemiesRemaining = 0;
        } else {
            console.log('Spawning normal enemy');
            enemy.speedX *= difficulty.speed;
            enemy.health *= difficulty.health;
            enemy.maxHealth = enemy.health;
        }
        
        this.game.enemies.push(enemy);
        this.enemiesRemaining--;
        
        const spawnInterval = Math.max(
            1000,
            GAME_CONFIG.WAVE.SPAWN_INTERVAL - (this.currentWave * GAME_CONFIG.WAVE.SPAWN_INTERVAL_DECREASE)
        );
        
        console.log('Enemy spawned:', {
            remainingEnemies: this.enemiesRemaining,
            nextSpawnIn: spawnInterval,
            enemySpeed: enemy.speedX
        });
        
        if (this.enemiesRemaining > 0) {
            setTimeout(() => this.spawnEnemy(), spawnInterval);
        } else {
            this.isSpawning = false;
        }
    }

    onWaveComplete() {
        if (!this.isSpawning && !this.game.cardSystem.isChoosingCard) {
            console.log('Wave tamamlandı, kart seçimi gösteriliyor');
            this.game.cardSystem.showCardSelection();
        }
    }
} 