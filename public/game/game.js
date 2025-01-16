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
        this.currency = GAME_CONFIG.CURRENCY.INITIAL;
        this.isTransitioningWave = false;
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
        
        // UI'ı oluştur
        this.createUI();
        
        // İlk wave'i başlat
        this.waveManager.spawnEnemy();
        
        this.maxHealth = 100;
        this.currentHealth = this.maxHealth;
        this.damagePerEnemy = 10;
        
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
                // Boss ödüllerini artır
                const isBoss = enemy.isBoss;
                this.score += isBoss ? 100 : 10;
                this.currency += isBoss ? 
                    GAME_CONFIG.CURRENCY.KILL_REWARD.BOSS : 
                    GAME_CONFIG.CURRENCY.KILL_REWARD.NORMAL;
                this.updateScore();
                this.updateCurrency();
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
        if (this.enemies.length === 0 && 
            !this.waveManager.isSpawning && 
            !this.cardSystem.isChoosingCard && 
            !this.isTransitioningWave) {
            
            this.isTransitioningWave = true;
            this.waveManager.onWaveComplete();
            setTimeout(() => {
                this.isTransitioningWave = false;
            }, 1000);
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

    updateHealthBar() {
        const healthFill = document.querySelector('.health-fill');
        if (healthFill) {
            const percentage = (this.currentHealth / this.maxHealth) * 100;
            healthFill.style.width = `${percentage}%`;
        }
    }

    // Score'u güncellemek için yeni metod
    updateScore() {
        const scoreDisplay = document.getElementById('scoreDisplay');
        if (scoreDisplay) {
            scoreDisplay.innerHTML = `
                <span class="icon"></span>
                <span>${this.score}</span>
            `;
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

    updateCurrency() {
        const currencyDisplay = document.getElementById('currencyDisplay');
        if (currencyDisplay) {
            currencyDisplay.innerHTML = `
                <div>GOLD</div>
                <div>${this.currency}</div>
            `;
        }
    }

    createUI() {
        const statsContainer = document.createElement('div');
        statsContainer.className = 'stats-container';

        // Health Bar
        const healthContainer = document.createElement('div');
        healthContainer.className = 'health-container';
        healthContainer.innerHTML = `
            <div class="health-label">CASTLE HEALTH</div>
            <div class="health-bar">
                <div class="health-fill" style="width: 100%"></div>
            </div>
        `;

        // Currency Display
        const currencyDisplay = document.createElement('div');
        currencyDisplay.id = 'currencyDisplay';
        currencyDisplay.className = 'ui-element';
        currencyDisplay.innerHTML = `
            <div>GOLD</div>
            <div>${this.currency}</div>
        `;

        // Wave Status
        const waveStatus = document.createElement('div');
        waveStatus.id = 'waveStatus';
        waveStatus.className = 'ui-element';
        waveStatus.innerHTML = `
            <div>WAVE</div>
            <div>${this.waveManager.currentWave}</div>
        `;

        // Score Display
        const scoreDisplay = document.createElement('div');
        scoreDisplay.id = 'scoreDisplay';
        scoreDisplay.className = 'ui-element';
        scoreDisplay.innerHTML = `
            <div>SCORE</div>
            <div><span class="icon"></span>${this.score}</div>
        `;

        statsContainer.appendChild(healthContainer);
        statsContainer.appendChild(currencyDisplay);
        statsContainer.appendChild(waveStatus);
        statsContainer.appendChild(scoreDisplay);

        document.body.appendChild(statsContainer);
    }
}

