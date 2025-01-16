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
        return isBossWave ? 1 : 
            GAME_CONFIG.WAVE.INITIAL_ENEMIES + 
            Math.floor((this.currentWave - 1) / 5) * GAME_CONFIG.WAVE.ENEMIES_INCREMENT;
    }

    updateWaveDisplay() {
        if (!this.waveStatus) return;
        this.waveStatus.textContent = `Wave ${this.currentWave}`;
    }

    startNewWave() {
        console.log('Starting new wave...');
        if (this.currentWave < 100) {
            this.currentWave++;
            this.enemiesRemaining = this.calculateEnemyCount();
            this.isSpawning = true;
            this.updateWaveDisplay();
            
            // Hemen yeni düşmanları spawn et
            setTimeout(() => this.spawnEnemy(), 500);
        }
    }

    spawnEnemy() {
        if (this.enemiesRemaining <= 0) {
            this.isSpawning = false;
            return;
        }
        
        const enemy = new Enemy(this.game.canvas, this.currentWave);
        this.game.enemies.push(enemy);
        this.enemiesRemaining--;
        
        const spawnInterval = Math.max(
            1000,
            GAME_CONFIG.WAVE.SPAWN_INTERVAL - (this.currentWave * GAME_CONFIG.WAVE.SPAWN_INTERVAL_DECREASE)
        );
        
        if (this.enemiesRemaining > 0) {
            setTimeout(() => this.spawnEnemy(), spawnInterval);
        } else {
            this.isSpawning = false;
        }
    }

    onWaveComplete() {
        if (!this.isSpawning && this.game.enemies.length === 0 && !this.game.cardSystem.isChoosingCard) {
            console.log('Wave completed, showing card selection');
            this.game.cardSystem.showCardSelection();
        }
    }
} 