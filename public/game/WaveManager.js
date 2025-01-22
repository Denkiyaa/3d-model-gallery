import { GAME_CONFIG } from './config.js';
import { Enemy } from './Enemy.js';

// Wave yönetimi
export class WaveManager {
    constructor(game) {
        this.game = game;
        this.currentWave = GAME_CONFIG.INITIAL_WAVE;
        this.enemiesRemaining = this.calculateEnemyCount();
        this.isSpawning = true;
    }

    updateWaveDisplay() {
        const waveStatus = document.getElementById('waveStatus');
        if (waveStatus) {
            waveStatus.innerHTML = `
                <div>WAVE</div>
                <div>${this.currentWave}</div>
            `;
        }
    }

    startNewWave() {
        if (this.isSpawning || this.game.cardSystem.isChoosingCard) return;
        
        console.log('Starting new wave...');
        this.currentWave++;
        this.enemiesRemaining = this.calculateEnemyCount();
        this.isSpawning = true;
        this.updateWaveDisplay();
        
        // Wave tamamlama bonusu
        this.game.currency += GAME_CONFIG.CURRENCY.WAVE_COMPLETION;
        this.game.updateCurrency();
        
        // Yeni düşmanları spawn et
        setTimeout(() => this.spawnEnemy(), 1000);
    }

    spawnEnemy() {
        if (this.enemiesRemaining <= 0) {
            this.isSpawning = false;
            return;
        }

        const isBossWave = this.currentWave % 5 === 0;
        const enemy = new Enemy(this.game.canvas, this.currentWave, isBossWave);
        this.game.enemies.push(enemy);
        this.enemiesRemaining--;

        if (this.enemiesRemaining > 0) {
            const spawnInterval = Math.max(
                1000,
                GAME_CONFIG.WAVE.SPAWN_INTERVAL - (this.currentWave * GAME_CONFIG.WAVE.SPAWN_INTERVAL_DECREASE)
            );
            setTimeout(() => this.spawnEnemy(), spawnInterval);
        } else {
            this.isSpawning = false;
        }
    }

    onWaveComplete() {
        if (!this.isSpawning && this.game.enemies.length === 0) {
            console.log('Wave completed, showing card selection');
            this.game.cardSystem.showCardSelection();
        }
    }

    calculateEnemyCount() {
        const isBossWave = this.currentWave % 5 === 0;
        return isBossWave ? 1 : 
            GAME_CONFIG.WAVE.INITIAL_ENEMIES + 
            Math.floor((this.currentWave - 1) / 5) * GAME_CONFIG.WAVE.ENEMIES_INCREMENT;
    }
} 