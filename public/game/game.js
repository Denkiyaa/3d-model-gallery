import { GAME_CONFIG } from './config.js';
import { Player } from './Player.js';
import { WaveManager } from './WaveManager.js';
import { CardSystem } from './CardSystem.js';

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
            // Oyun başlatma işlemlerine devam et
            this.initializeGame();
        })
        .catch(error => {
            console.error('Oyuncu kayıt hatası:', error);
            alert('Oyuncu kaydedilirken bir hata oluştu!');
        });
    }

    // Oyun başlatma işlemlerini ayrı bir metoda alalım
    initializeGame() {
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
        this.damagePerEnemy = 10;
        
        this.createHealthBar();
        
        // Oyun nesnesini global olarak erişilebilir yap
        window.game = this;
        
        // Game loop'u başlat
        this.gameLoop();
    }

    gameLoop = () => {
        this.update();
        this.draw();
        requestAnimationFrame(this.gameLoop);
    }

    update() {
        if (this.isGameOver) return; // Oyun bittiyse güncelleme yapma
        
        if (this.cardSystem.isChoosingCard) return;
        
        // Update player
        this.player.update();
        
        // Update enemies and check collisions
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            
            // Düşman kaleye ulaştı mı?
            if (enemy.x <= GAME_CONFIG.CASTLE_X + GAME_CONFIG.CASTLE_WIDTH) {
                // Boss ise daha fazla hasar versin
                if (enemy.isBoss) {
                    this.currentHealth -= this.damagePerEnemy * 3; // Boss 3 kat hasar versin
                } else {
                    this.currentHealth -= this.damagePerEnemy;
                }
                
                this.updateHealthBar();
                this.enemies.splice(i, 1);
                
                // Can sıfırın altına düştü mü?
                if (this.currentHealth <= 0) {
                    this.gameOver();
                    return; // Oyun bitti, güncellemeyi durdur
                }
                continue;
            }
            
            enemy.update();
            
            // Düşman öldü mü?
            if (enemy.health <= 0) {
                this.enemies.splice(i, 1);
                // Boss ölünce daha fazla skor ver
                this.score += enemy.isBoss ? 50 : 10;
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
        // Gökyüzü
        const skyGradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        skyGradient.addColorStop(0, '#4A90E2');  // Koyu mavi
        skyGradient.addColorStop(0.5, '#87CEEB'); // Açık mavi
        skyGradient.addColorStop(1, '#B4E1FF');   // Beyazımsı mavi
        this.ctx.fillStyle = skyGradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Rastgele bulutlar
        this.drawClouds();

        // Zemin
        const groundGradient = this.ctx.createLinearGradient(0, this.canvas.height * 0.4, 0, this.canvas.height);
        groundGradient.addColorStop(0, '#567d46');   // Koyu yeşil
        groundGradient.addColorStop(0.6, '#4a8505'); // Orta yeşil
        groundGradient.addColorStop(1, '#3a6804');   // En koyu yeşil
        this.ctx.fillStyle = groundGradient;
        this.ctx.fillRect(0, this.canvas.height * 0.4, this.canvas.width, this.canvas.height * 0.6);

        // Rastgele çimenler
        this.drawGrass();

        // Rastgele taşlar
        this.drawRocks();

        // Rastgele ağaçlar
        this.drawTrees();

        // Kale
        this.drawCastle();

        // Oyun objeleri
        this.player.draw(this.ctx);
        this.enemies.forEach(enemy => enemy.draw(this.ctx));
        this.arrows.forEach(arrow => arrow.draw(this.ctx));
    }

    drawClouds() {
        // Her bulut için farklı boyut ve opaklık
        this.clouds = this.clouds || Array(10).fill().map(() => ({
            x: Math.random() * this.canvas.width,
            y: Math.random() * (this.canvas.height * 0.3),
            size: Math.random() * 30 + 20,
            opacity: Math.random() * 0.3 + 0.5,
            speed: Math.random() * 0.2 + 0.1
        }));

        this.clouds.forEach(cloud => {
            cloud.x += cloud.speed;
            if (cloud.x > this.canvas.width + 100) cloud.x = -100;

            this.ctx.fillStyle = `rgba(255, 255, 255, ${cloud.opacity})`;
            this.ctx.beginPath();
            this.ctx.arc(cloud.x, cloud.y, cloud.size, 0, Math.PI * 2);
            this.ctx.arc(cloud.x - cloud.size * 0.5, cloud.y, cloud.size * 0.6, 0, Math.PI * 2);
            this.ctx.arc(cloud.x + cloud.size * 0.5, cloud.y, cloud.size * 0.8, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    drawGrass() {
        // Rastgele çimen kümeleri
        this.grassPatches = this.grassPatches || Array(200).fill().map(() => ({
            x: Math.random() * this.canvas.width,
            y: Math.random() * (this.canvas.height * 0.6) + this.canvas.height * 0.4,
            height: Math.random() * 15 + 5
        }));

        this.grassPatches.forEach(grass => {
            this.ctx.strokeStyle = '#2d5016';
            this.ctx.beginPath();
            this.ctx.moveTo(grass.x, grass.y);
            this.ctx.lineTo(grass.x - 2, grass.y - grass.height);
            this.ctx.moveTo(grass.x, grass.y);
            this.ctx.lineTo(grass.x + 2, grass.y - grass.height);
            this.ctx.stroke();
        });
    }

    drawRocks() {
        // Rastgele taşlar
        this.rocks = this.rocks || Array(30).fill().map(() => ({
            x: Math.random() * this.canvas.width,
            y: Math.random() * (this.canvas.height * 0.5) + this.canvas.height * 0.4,
            size: Math.random() * 20 + 10,
            color: `rgb(${120 + Math.random() * 40}, ${120 + Math.random() * 40}, ${120 + Math.random() * 40})`
        }));

        this.rocks.forEach(rock => {
            this.ctx.fillStyle = rock.color;
            this.ctx.beginPath();
            this.ctx.ellipse(rock.x, rock.y, rock.size, rock.size * 0.7, 0, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    drawTrees() {
        // Rastgele ağaçlar
        this.trees = this.trees || Array(15).fill().map(() => ({
            x: Math.random() * this.canvas.width,
            y: Math.random() * (this.canvas.height * 0.3) + this.canvas.height * 0.4,
            size: Math.random() * 0.5 + 0.7,
            type: Math.floor(Math.random() * 2), // Sadece 2 ağaç tipi (0: yuvarlak, 1: çam)
            swayOffset: Math.random() * Math.PI * 2,
            color: {
                leaf: `hsl(${90 + Math.random() * 40}, ${70 + Math.random() * 20}%, ${30 + Math.random() * 20}%)`,
                trunk: `hsl(30, ${20 + Math.random() * 20}%, ${20 + Math.random() * 10}%)`
            }
        }));

        this.trees.forEach(tree => {
            const sway = Math.sin(Date.now() * 0.001 + tree.swayOffset) * 3;

            // Gövde
            this.ctx.fillStyle = tree.color.trunk;
            const trunkWidth = 15 * tree.size;
            const trunkHeight = 70 * tree.size;

            // Gövde gölgesi
            this.ctx.fillStyle = 'rgba(0,0,0,0.2)';
            this.ctx.fillRect(tree.x - trunkWidth/2 + 2, tree.y, trunkWidth, trunkHeight);

            // Ana gövde
            this.ctx.fillStyle = tree.color.trunk;
            this.ctx.fillRect(tree.x - trunkWidth/2, tree.y, trunkWidth, trunkHeight);

            // Yapraklar
            this.ctx.fillStyle = tree.color.leaf;
            const leafSize = 50 * tree.size;

            switch(tree.type) {
                case 0: // Yuvarlak ağaç
                    for(let i = 0; i < 3; i++) {
                        this.ctx.beginPath();
                        this.ctx.arc(
                            tree.x + sway * (i/3), 
                            tree.y - leafSize * 0.8 * i, 
                            leafSize * (1 - i * 0.2), 
                            0, Math.PI * 2
                        );
                        this.ctx.fill();
                    }
                    break;

                case 1: // Çam ağacı
                    this.ctx.save();
                    this.ctx.translate(tree.x, tree.y);
                    this.ctx.rotate(sway * 0.02);
                    
                    // Gövde
                    const trunkWidth = 15 * tree.size;
                    const trunkHeight = 40 * tree.size;
                    
                    // Gövde gölgesi
                    this.ctx.fillStyle = 'rgba(0,0,0,0.2)';
                    this.ctx.fillRect(-trunkWidth/2 + 2, 0, trunkWidth, trunkHeight);
                    
                    // Ana gövde
                    this.ctx.fillStyle = tree.color.trunk;
                    this.ctx.fillRect(-trunkWidth/2, 0, trunkWidth, trunkHeight);
                    
                    // Tek bir büyük üçgen
                    const treeWidth = leafSize * 1.5;
                    const treeHeight = leafSize * 2;
                    
                    // Gölge üçgen
                    this.ctx.fillStyle = 'rgba(0,0,0,0.2)';
                    this.ctx.beginPath();
                    this.ctx.moveTo(-treeWidth/2 + 2, trunkHeight + 2);
                    this.ctx.lineTo(treeWidth/2 + 2, trunkHeight + 2);
                    this.ctx.lineTo(0, -treeHeight + trunkHeight + 2);
                    this.ctx.closePath();
                    this.ctx.fill();
                    
                    // Ana üçgen
                    this.ctx.fillStyle = tree.color.leaf;
                    this.ctx.beginPath();
                    this.ctx.moveTo(-treeWidth/2, trunkHeight);
                    this.ctx.lineTo(treeWidth/2, trunkHeight);
                    this.ctx.lineTo(0, -treeHeight + trunkHeight);
                    this.ctx.closePath();
                    this.ctx.fill();
                    
                    this.ctx.restore();
                    break;
            }

            // Yaprak gölgeleri
            this.ctx.fillStyle = 'rgba(0,0,0,0.1)';
            this.ctx.beginPath();
            this.ctx.ellipse(tree.x + leafSize/3, tree.y + trunkHeight, leafSize * 0.8, leafSize * 0.3, 0, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    drawCastle() {
        const castleX = GAME_CONFIG.CASTLE_X;
        const castleWidth = GAME_CONFIG.CASTLE_WIDTH;
        const groundY = this.canvas.height * 0.95;
        const castleHeight = this.canvas.height * 0.8;

        // Kale gölgesi
        this.ctx.fillStyle = 'rgba(0,0,0,0.2)';
        this.ctx.beginPath();
        this.ctx.ellipse(
            castleX + castleWidth/2,
            groundY,
            castleWidth * 0.8,
            20,
            0, 0, Math.PI * 2
        );
        this.ctx.fill();

        // Ana duvar
        const wallGradient = this.ctx.createLinearGradient(castleX, 0, castleX + castleWidth, 0);
        wallGradient.addColorStop(0, '#4a4a4a');
        wallGradient.addColorStop(0.2, '#6a6a6a');
        wallGradient.addColorStop(0.8, '#6a6a6a');
        wallGradient.addColorStop(1, '#4a4a4a');
        
        this.ctx.fillStyle = wallGradient;
        this.ctx.fillRect(castleX, groundY - castleHeight, castleWidth, castleHeight);

        // Duvar taşları
        const stoneRows = 12;
        const stoneCols = 5;
        const stoneWidth = castleWidth / stoneCols;
        const stoneHeight = castleHeight / stoneRows;

        for(let row = 0; row < stoneRows; row++) {
            const offsetX = row % 2 ? stoneWidth/2 : 0; // Alternatif sıralarda offset
            for(let col = 0; col < stoneCols + (row % 2 ? -1 : 0); col++) {
                const x = castleX + col * stoneWidth + offsetX;
                const y = groundY - castleHeight + row * stoneHeight;
                
                // Taş gölgesi
                this.ctx.fillStyle = 'rgba(0,0,0,0.1)';
                this.ctx.fillRect(x + 2, y + 2, stoneWidth - 4, stoneHeight - 4);
                
                // Taş çizgisi
                this.ctx.strokeStyle = 'rgba(0,0,0,0.2)';
                this.ctx.strokeRect(x + 2, y + 2, stoneWidth - 4, stoneHeight - 4);
            }
        }

        // Kale kapısı
        const doorWidth = castleWidth * 0.4;
        const doorHeight = castleHeight * 0.4;
        const doorX = castleX + (castleWidth - doorWidth) / 2;
        const doorY = groundY - doorHeight;
        const archHeight = doorHeight * 0.3;

        // Kapı kemeri gölgesi
        this.ctx.fillStyle = '#2a2a2a';
        this.ctx.beginPath();
        this.ctx.moveTo(doorX - 10, doorY);
        this.ctx.lineTo(doorX + doorWidth + 10, doorY);
        this.ctx.lineTo(doorX + doorWidth + 10, doorY + doorHeight - archHeight);
        this.ctx.arc(doorX + doorWidth/2, doorY + doorHeight - archHeight, 
                     doorWidth/2 + 10, 0, Math.PI, true);
        this.ctx.closePath();
        this.ctx.fill();

        // Kapı iç kısmı
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.beginPath();
        this.ctx.moveTo(doorX, doorY);
        this.ctx.lineTo(doorX + doorWidth, doorY);
        this.ctx.lineTo(doorX + doorWidth, doorY + doorHeight - archHeight);
        this.ctx.arc(doorX + doorWidth/2, doorY + doorHeight - archHeight, 
                     doorWidth/2, 0, Math.PI, true);
        this.ctx.closePath();
        this.ctx.fill();

        // Kapı panelleri
        const woodGradient = this.ctx.createLinearGradient(doorX, doorY, doorX, doorY + doorHeight);
        woodGradient.addColorStop(0, '#3a2820');
        woodGradient.addColorStop(0.5, '#2a1810');
        woodGradient.addColorStop(1, '#1a0800');

        for(let i = 0; i < 2; i++) {
            this.ctx.fillStyle = woodGradient;
            this.ctx.fillRect(
                doorX + i * (doorWidth/2) + 5,
                doorY + 5,
                doorWidth/2 - 10,
                doorHeight - archHeight - 10
            );

            // Metal çiviler
            this.ctx.fillStyle = '#B8860B';
            for(let j = 0; j < 3; j++) {
                for(let k = 0; k < 2; k++) {
                    this.ctx.beginPath();
                    this.ctx.arc(
                        doorX + (i * doorWidth/2) + doorWidth/4 + (k * doorWidth/4) - doorWidth/8,
                        doorY + doorHeight * (0.2 + j * 0.25),
                        4, 0, Math.PI * 2
                    );
                    this.ctx.fill();
                }
            }
        }

        // Kapı kulpları
        const handleGradient = this.ctx.createRadialGradient(
            doorX + doorWidth * 0.25, doorY + doorHeight * 0.5, 0,
            doorX + doorWidth * 0.25, doorY + doorHeight * 0.5, 10
        );
        handleGradient.addColorStop(0, '#FFD700');
        handleGradient.addColorStop(1, '#B8860B');

        this.ctx.fillStyle = handleGradient;
        this.ctx.beginPath();
        this.ctx.arc(doorX + doorWidth * 0.25, doorY + doorHeight * 0.4, 8, 0, Math.PI * 2);
        this.ctx.arc(doorX + doorWidth * 0.75, doorY + doorHeight * 0.4, 8, 0, Math.PI * 2);
        this.ctx.fill();
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

        // Skoru otomatik kaydet
        const API_URL = 'https://craftedfromfilament.com/api/score';
        fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
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
                    <div class="button-group">
                        <button id="playAgain" class="medieval-button">Play Again</button>
                        <button id="showLeaderboard" class="medieval-button gold">Leaderboard</button>
                    </div>
                </div>
            `;
            document.body.appendChild(gameOverScreen);

            // Play Again butonu
            document.getElementById('playAgain').addEventListener('click', () => {
                window.location.reload();
            });

            // Leaderboard butonu
            document.getElementById('showLeaderboard').addEventListener('click', () => {
                const leaderboardContainer = document.getElementById('leaderboardContainer');
                if (leaderboardContainer) {
                    leaderboardContainer.style.display = 'block';
                    // Leaderboard'u güncelle
                    document.getElementById('showLeaderboard').click();
                }
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
                    <div class="button-group">
                        <button id="playAgain" class="medieval-button">Play Again</button>
                    </div>
                </div>
            `;
            document.body.appendChild(gameOverScreen);

            document.getElementById('playAgain').addEventListener('click', () => {
                window.location.reload();
            });
        });
    }
}

