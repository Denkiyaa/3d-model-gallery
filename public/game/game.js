import { GAME_CONFIG } from './config.js';
import { Player } from './Player.js';
import { WaveManager } from './WaveManager.js';
import { CardSystem } from './CardSystem.js';
import { Castle } from './Castle.js';
import { Environment } from './Environment.js';
import { DamageText } from './DamageText.js';

export class Game {
    constructor(nickname) {
        this.nickname = nickname;
        
        // Sunucudaki API'ye istek yap
        const API_URL = 'https://craftedfromfilament.com/api/login';
        
        console.log('Oyuncu kaydı yapılıyor:', {
            url: API_URL,
            nickname: this.nickname
        });
        
        // Önce oyuncuyu kaydet
        fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nickname: this.nickname })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Oyuncu kaydedilemedi');
            }
            return response.json();
        })
        .then(data => {
            console.log('Oyuncu kaydedildi:', data);
            this.initializeGame();
        })
        .catch(error => {
            console.error('Oyuncu kayıt hatası:', error);
            alert('Oyuncu kaydedilirken bir hata oluştu!');
        });

        this.damageTexts = [];  // Hasar yazılarını tutacak array
    }

    initializeGame() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Canvas boyutlarını ayarla
        this.canvas.width = window.innerWidth - GAME_CONFIG.CANVAS_PADDING * 2;
        this.canvas.height = window.innerHeight - GAME_CONFIG.CANVAS_PADDING * 2;
        
        // Çevre elemanlarını tek bir sınıfta topla
        this.environment = new Environment(this.ctx);
        this.castle = new Castle(this.ctx, GAME_CONFIG);
        
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
        this.damagePerEnemy = 10;
        
        this.createHealthBar();
        
        // Oyun nesnesini global olarak erişilebilir yap
        window.game = this;
        
        // En son game loop'u başlat
        this.gameLoop();
    }

    gameLoop = () => {
        this.update();
        this.draw();
        requestAnimationFrame(this.gameLoop);
    }

    update() {
        if (this.isGameOver) return;
        if (this.cardSystem.isChoosingCard) return;
        
        // Update player
        this.player.update();
        
        // Update enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            
            if (enemy.x <= GAME_CONFIG.CASTLE_X + GAME_CONFIG.CASTLE_WIDTH) {
                this.currentHealth -= enemy.damage;
                this.enemies.splice(i, 1);
                this.updateHealthBar();
                continue;
            }

            if (enemy.health <= 0) {
                this.enemies.splice(i, 1);
                this.score += enemy.isBoss ? 100 : 10;
                this.updateScore();
                continue;
            }

            enemy.update();
        }
        
        // Update arrows
        for (let i = this.arrows.length - 1; i >= 0; i--) {
            const arrow = this.arrows[i];
            arrow.update();
            
            // Ok çarptı mı kontrol et
            for (const enemy of this.enemies) {
                if (this.checkCollision(arrow, enemy)) {
                    // Kritik vuruş kontrolü
                    const isCritical = Math.random() < (this.player.criticalChance || 0);
                    const damage = isCritical ? 
                        this.player.damage * (this.player.criticalDamage || 1.5) : 
                        this.player.damage;
                    
                    enemy.health -= damage;
                    
                    // Hasar yazısını ekle
                    this.damageTexts.push(new DamageText(
                        enemy.x + enemy.width / 2,
                        enemy.y,
                        Math.floor(damage),
                        isCritical
                    ));
                    
                    this.arrows.splice(i, 1);
                    break;
                }
            }
        }

        // Wave kontrolü
        if (this.enemies.length === 0 && !this.waveManager.isSpawning) {
            this.waveManager.onWaveComplete();
        }

        // Update damage texts
        for (let i = this.damageTexts.length - 1; i >= 0; i--) {
            if (!this.damageTexts[i].update()) {
                this.damageTexts.splice(i, 1);
            }
        }

        // Game over kontrolü
        if (this.currentHealth <= 0) {
            this.gameOver();
        }
    }

    checkCollision(arrow, enemy) {
        return (arrow.x < enemy.x + enemy.width &&
                arrow.x + arrow.width > enemy.x &&
                arrow.y < enemy.y + enemy.height &&
                arrow.y + arrow.height > enemy.y);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Çizim sırası önemli - arkadan öne doğru çizmeliyiz
        
        // 1. Önce arkaplanı çiz
        this.environment.draw();
        
        // 2. Kaleyi çiz
        this.castle.draw(this.canvas.height * 0.95);
        
        // 3. Düşmanları çiz
        this.enemies.forEach(enemy => enemy.draw(this.ctx));
        
        // 4. Okları çiz
        this.arrows.forEach(arrow => arrow.draw(this.ctx));
        
        // 5. Oyuncuyu çiz
        this.player.draw(this.ctx);
        
        // 6. Hasar yazılarını çiz
        this.damageTexts = this.damageTexts.filter(text => {
            const isAlive = text.update();
            if (isAlive) {
                text.draw(this.ctx);
            }
            return isAlive;
        });
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

    gameOver() {
        if (this.isGameOver) return;
        this.isGameOver = true;
        
        // UI elementlerini temizle
        const healthContainer = document.querySelector('.health-container');
        if (healthContainer) healthContainer.remove();

        const waveStatus = document.getElementById('waveStatus');
        if (waveStatus) waveStatus.style.display = 'none';

        // Skoru kaydet
        fetch(`${this.API_BASE_URL}/api/score`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                nickname: this.nickname,
                score: this.score
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Skor kaydedildi:', data);
            
            // Game Over ekranı
            const gameOverScreen = document.createElement('div');
            gameOverScreen.className = 'game-over-screen';
            gameOverScreen.innerHTML = `
                <div class="game-over-content">
                    <h1>Game Over!</h1>
                    <p>Player: ${this.nickname}</p>
                    <p>Wave: ${this.waveManager.currentWave}</p>
                    <p>Final Score: ${this.score}</p>
                    <button id="playAgain" class="medieval-button">Play Again</button>
                </div>
            `;
            document.body.appendChild(gameOverScreen);

            // Play Again butonu
            document.getElementById('playAgain').addEventListener('click', () => {
                window.location.reload();
            });
        })
        .catch(error => {
            console.error('Skor kaydetme hatası:', error);
            // Hata olsa bile game over ekranını göster
            const gameOverScreen = document.createElement('div');
            gameOverScreen.className = 'game-over-screen';
            gameOverScreen.innerHTML = `
                <div class="game-over-content">
                    <h1>Game Over!</h1>
                    <p>Player: ${this.nickname}</p>
                    <p>Wave: ${this.waveManager.currentWave}</p>
                    <p>Final Score: ${this.score}</p>
                    <button id="playAgain" class="medieval-button">Play Again</button>
                </div>
            `;
            document.body.appendChild(gameOverScreen);

            document.getElementById('playAgain').addEventListener('click', () => {
                window.location.reload();
            });
        });
    }
}

