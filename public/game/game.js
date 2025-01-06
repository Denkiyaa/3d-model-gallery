import { GAME_CONFIG } from './config.js';
import { Player } from './Player.js';
import { WaveManager } from './WaveManager.js';
import { CardSystem } from './CardSystem.js';

export class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Canvas boyutlarını ayarla
        this.canvas.width = window.innerWidth - GAME_CONFIG.CANVAS_PADDING * 2;
        this.canvas.height = window.innerHeight - GAME_CONFIG.CANVAS_PADDING * 2;
        
        this.lives = GAME_CONFIG.INITIAL_LIVES;
        this.score = 0;
        this.enemies = [];
        this.arrows = [];
        
        this.player = new Player(this.canvas);
        this.player.game = this;
        
        this.waveManager = new WaveManager(this);
        this.cardSystem = new CardSystem(this);
        
        // İlk wave'i başlat
        this.waveManager.spawnEnemy();
        
        this.maxHealth = 100;
        this.currentHealth = this.maxHealth;
        
        // Health bar oluştur
        this.createHealthBar();
        
        // Game loop'u başlat
        this.gameLoop();
    }

    gameLoop = () => {
        this.update();
        this.draw();
        requestAnimationFrame(this.gameLoop);
    }

    update() {
        if (this.cardSystem.isChoosingCard) return;
        
        // Update player
        this.player.update();
        
        // Update enemies and check collisions
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            
            // Düşman kaleye ulaştı mı?
            if (enemy.x <= GAME_CONFIG.CASTLE_X) {
                this.currentHealth -= enemy.damage;
                this.updateHealthBar();
                this.enemies.splice(i, 1);
                continue;
            }
            
            enemy.update();
            
            // Düşman öldü mü?
            if (enemy.health <= 0) {
                this.enemies.splice(i, 1);
                this.score += 10;
                this.updateScore();
                continue;
            }
        }
        
        // Update arrows and check collisions
        for (let i = this.arrows.length - 1; i >= 0; i--) {
            const arrow = this.arrows[i];
            arrow.update();
            
            // Ok ekrandan çıktı mı?
            if (arrow.x > this.canvas.width || arrow.x < 0 || 
                arrow.y > this.canvas.height || arrow.y < 0) {
                this.arrows.splice(i, 1);
                continue;
            }
            
            // Hedef düşman ölmüş mü?
            if (!this.enemies.includes(arrow.target)) {
                this.arrows.splice(i, 1);
                continue;
            }
            
            // Ok düşmana çarptı mı?
            if (this.checkCollision(arrow, arrow.target)) {
                const damage = arrow.critical ? this.player.damage * 2 : this.player.damage;
                arrow.target.health -= damage;
                this.arrows.splice(i, 1);
            }
        }
        
        // Wave completion check with debug logs
        if (this.enemies.length === 0) {
            console.log('Düşman kalmadı');
            console.log('isSpawning:', this.waveManager.isSpawning);
            console.log('isChoosingCard:', this.cardSystem.isChoosingCard);
            console.log('currentWave:', this.waveManager.currentWave);
            
            if (!this.waveManager.isSpawning && 
                !this.cardSystem.isChoosingCard && 
                this.waveManager.currentWave < 100) {
                console.log('Kart seçim ekranı gösterilecek');
                this.cardSystem.showCardSelection();
            }
        }
    }

    checkCollision(arrow, enemy) {
        return arrow.x < enemy.x + enemy.width &&
               arrow.x + arrow.width > enemy.x &&
               arrow.y < enemy.y + enemy.height &&
               arrow.y + arrow.height > enemy.y;
    }

    draw() {
        // Gökyüzü gradyanı
        const skyGradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height * 0.6);
        skyGradient.addColorStop(0, '#87CEEB');    // Açık mavi
        skyGradient.addColorStop(1, '#E0F6FF');    // Beyazımsı mavi
        this.ctx.fillStyle = skyGradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height * 0.6);

        // Zemin gradyanı
        const groundGradient = this.ctx.createLinearGradient(0, this.canvas.height * 0.6, 0, this.canvas.height);
        groundGradient.addColorStop(0, '#4a8505');  // Koyu yeşil
        groundGradient.addColorStop(1, '#3a6804');  // Daha koyu yeşil
        this.ctx.fillStyle = groundGradient;
        this.ctx.fillRect(0, this.canvas.height * 0.6, this.canvas.width, this.canvas.height * 0.4);

        // Yol çizimi
        this.ctx.fillStyle = '#8B4513';  // Kahverengi yol
        this.ctx.fillRect(0, this.canvas.height * 0.7, this.canvas.width, this.canvas.height * 0.15);

        // Yol detayları
        this.ctx.fillStyle = '#654321';  // Koyu kahverengi
        for(let i = 0; i < this.canvas.width; i += 50) {
            this.ctx.fillRect(i, this.canvas.height * 0.7, 2, this.canvas.height * 0.15);
        }

        // Bulutlar
        this.drawClouds();

        // Ağaçlar
        this.drawTrees();

        // Kale
        this.drawCastle();

        // Oyun objeleri
        this.player.draw(this.ctx);
        this.enemies.forEach(enemy => enemy.draw(this.ctx));
        this.arrows.forEach(arrow => arrow.draw(this.ctx));
    }

    drawClouds() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        // Sabit bulut pozisyonları
        const cloudPositions = [
            {x: 100, y: 50},
            {x: 300, y: 80},
            {x: 600, y: 60},
            {x: 900, y: 70}
        ];

        cloudPositions.forEach(pos => {
            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y, 20, 0, Math.PI * 2);
            this.ctx.arc(pos.x - 15, pos.y + 10, 20, 0, Math.PI * 2);
            this.ctx.arc(pos.x + 15, pos.y + 10, 20, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    drawTrees() {
        // Sabit ağaç pozisyonları
        const treePositions = [
            {x: 150, y: this.canvas.height * 0.6},
            {x: 450, y: this.canvas.height * 0.6},
            {x: 750, y: this.canvas.height * 0.6},
            {x: 1050, y: this.canvas.height * 0.6}
        ];

        treePositions.forEach(pos => {
            // Gövde
            this.ctx.fillStyle = '#4B3621';
            this.ctx.fillRect(pos.x - 10, pos.y - 60, 20, 60);

            // Yapraklar
            this.ctx.fillStyle = '#228B22';
            this.ctx.beginPath();
            this.ctx.moveTo(pos.x, pos.y - 120);
            this.ctx.lineTo(pos.x - 30, pos.y - 60);
            this.ctx.lineTo(pos.x + 30, pos.y - 60);
            this.ctx.fill();

            this.ctx.beginPath();
            this.ctx.moveTo(pos.x, pos.y - 100);
            this.ctx.lineTo(pos.x - 40, pos.y - 30);
            this.ctx.lineTo(pos.x + 40, pos.y - 30);
            this.ctx.fill();
        });
    }

    drawCastle() {
        const castleX = GAME_CONFIG.CASTLE_X;
        const castleWidth = GAME_CONFIG.CASTLE_WIDTH;
        const castleHeight = this.canvas.height;

        // Ana kale yapısı
        this.ctx.fillStyle = '#808080';
        this.ctx.fillRect(castleX, 0, castleWidth, castleHeight);

        // Kale detayları
        this.ctx.fillStyle = '#696969';
        // Mazgallar
        for(let y = 50; y < castleHeight; y += 100) {
            this.ctx.fillRect(castleX - 5, y, castleWidth + 10, 20);
        }

        // Kale tepesi
        this.ctx.fillStyle = '#A0522D';
        for(let i = 0; i < 5; i++) {
            this.ctx.fillRect(
                castleX + (i * (castleWidth/4)), 
                0, 
                castleWidth/8, 
                40
            );
        }
    }

    drawUI() {
        this.ctx.fillStyle = 'white';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Lives: ${this.lives}`, 10, 30);
        this.ctx.fillText(`Score: ${this.score}`, 10, 60);
    }

    createHealthBar() {
        // Ana container
        const healthContainer = document.createElement('div');
        healthContainer.className = 'health-container';
        
        // Health label
        const healthLabel = document.createElement('div');
        healthLabel.className = 'health-label';
        healthLabel.textContent = 'CASTLE HEALTH';
        
        // Health bar
        const healthBar = document.createElement('div');
        healthBar.className = 'health-bar';
        
        const healthFill = document.createElement('div');
        healthFill.className = 'health-fill';
        
        // Score display
        const scoreDisplay = document.createElement('div');
        scoreDisplay.className = 'score-display';
        scoreDisplay.textContent = `Score: ${this.score}`;
        this.scoreDisplay = scoreDisplay; // Score'u güncelleyebilmek için referansı sakla
        
        // Elementleri birleştir
        healthBar.appendChild(healthFill);
        healthContainer.appendChild(healthLabel);
        healthContainer.appendChild(healthBar);
        healthContainer.appendChild(scoreDisplay);
        document.body.appendChild(healthContainer);
        
        this.healthFill = healthFill;
    }

    updateHealthBar() {
        const percentage = (this.currentHealth / this.maxHealth) * 100;
        this.healthFill.style.width = `${percentage}%`;
        
        if (this.currentHealth <= 0) {
            // Game Over logic here
            console.log('Game Over!');
        }
    }

    // Score'u güncellemek için yeni metod
    updateScore() {
        if (this.scoreDisplay) {
            this.scoreDisplay.textContent = `Score: ${this.score}`;
        }
    }
}

