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
        // Her wave'de düşman sayısı artar
        return 5 + Math.floor(this.currentWave * 0.5);
    }

    updateWaveDisplay() {
        this.waveStatus.textContent = `Wave ${this.currentWave}`;
    }

    startNewWave() {
        console.log('startNewWave çağrıldı');
        console.log('Mevcut wave:', this.currentWave);
        
        if (this.currentWave < 100) {
            this.currentWave++;
            this.enemiesRemaining = this.calculateEnemyCount();
            this.isSpawning = true;
            console.log('Yeni wave başlatılıyor:', this.currentWave);
            console.log('Spawn edilecek düşman sayısı:', this.enemiesRemaining);
            
            this.updateWaveDisplay();
            this.spawnEnemy();
        }
    }

    spawnEnemy() {
        console.log('spawnEnemy çağrıldı');
        console.log('Kalan düşman:', this.enemiesRemaining);
        
        if (this.enemiesRemaining <= 0) {
            console.log('Spawn edilecek düşman kalmadı');
            this.isSpawning = false;
            return;
        }
        
        const enemy = new Enemy(this.game.canvas, this.currentWave);
        enemy.health += Math.floor(this.currentWave * 0.5);
        enemy.damage += Math.floor(this.currentWave * 0.2);
        
        this.game.enemies.push(enemy);
        this.enemiesRemaining--;
        
        console.log('Düşman spawn edildi, kalan:', this.enemiesRemaining);
        
        if (this.enemiesRemaining > 0) {
            setTimeout(() => this.spawnEnemy(), GAME_CONFIG.SPAWN_DELAY);
        } else {
            console.log('Son düşman spawn edildi');
            this.isSpawning = false;
        }
    }
} 