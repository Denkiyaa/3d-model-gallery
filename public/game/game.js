import { GAME_CONFIG } from './config.js';
import { Player } from './Player.js';
import { WaveManager } from './WaveManager.js';
import { CardSystem } from './CardSystem.js';

export class Game {
    constructor(nickname) {
        this.nickname = nickname;
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
        const groundY = this.canvas.height * 0.95; // Neredeyse en alta kadar
        const castleHeight = this.canvas.height * 0.75; // Daha uzun kale
        const wallDepth = castleWidth * 0.3;
        const angle = Math.PI / 22.5; // 8 derece (180/22.5 = 8)

        // Zemin gölgesi
        this.ctx.fillStyle = 'rgba(0,0,0,0.2)';
        this.ctx.beginPath();
        this.ctx.ellipse(
            castleX + castleWidth/2,
            groundY,
            castleWidth * 0.7,
            30,
            0, 0, Math.PI * 2
        );
        this.ctx.fill();

        // Sağ duvar (yan yüz)
        this.ctx.save();
        this.ctx.translate(castleX, groundY);
        this.ctx.rotate(angle);

        // Ana duvar (ön yüz)
        this.ctx.fillStyle = '#606060';
        this.ctx.fillRect(0, -castleHeight, castleWidth, castleHeight);

        // Ana duvar taş dokusu
        for(let i = 0; i < 15; i++) {
            for(let j = 0; j < 6; j++) {
                this.ctx.strokeStyle = 'rgba(0,0,0,0.15)';
                this.ctx.strokeRect(
                    j * (castleWidth/6),
                    -castleHeight + i * (castleHeight/15),
                    castleWidth/6,
                    castleHeight/15
                );
            }
        }

        // Yan duvar (sağ yüz)
        this.ctx.fillStyle = '#404040';
        this.ctx.beginPath();
        this.ctx.moveTo(castleWidth, 0);
        this.ctx.lineTo(castleWidth + wallDepth, -wallDepth);
        this.ctx.lineTo(castleWidth + wallDepth, -castleHeight - wallDepth);
        this.ctx.lineTo(castleWidth, -castleHeight);
        this.ctx.closePath();
        this.ctx.fill();

        // Yan duvar taş dokusu
        for(let i = 0; i < 12; i++) {
            for(let j = 0; j < 3; j++) {
                this.ctx.strokeStyle = 'rgba(0,0,0,0.2)';
                const x = castleWidth + (j * wallDepth/3);
                const y = -castleHeight + (i * castleHeight/12);
                this.ctx.beginPath();
                this.ctx.moveTo(x, y);
                this.ctx.lineTo(x + wallDepth/3, y - wallDepth/3);
                this.ctx.stroke();
            }
        }

        // Kale kapısı (daha büyük ve belirgin)
        const doorWidth = castleWidth * 0.35;
        const doorHeight = castleHeight * 0.3;
        const doorX = (castleWidth - doorWidth) / 2;
        const doorY = -doorHeight;

        // Kapı kemeri ve çerçevesi
        this.ctx.fillStyle = '#303030';
        this.ctx.beginPath();
        this.ctx.moveTo(doorX - 20, doorY);
        this.ctx.lineTo(doorX + doorWidth + 20, doorY);
        this.ctx.lineTo(doorX + doorWidth + 20, doorY + doorHeight * 0.8);
        this.ctx.arc(doorX + doorWidth/2, doorY + doorHeight * 0.8, doorWidth/2 + 20, 0, Math.PI, true);
        this.ctx.closePath();
        this.ctx.fill();

        // Kapı gölgesi
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.beginPath();
        this.ctx.moveTo(doorX, doorY);
        this.ctx.lineTo(doorX + doorWidth, doorY);
        this.ctx.lineTo(doorX + doorWidth, doorY + doorHeight * 0.8);
        this.ctx.arc(doorX + doorWidth/2, doorY + doorHeight * 0.8, doorWidth/2, 0, Math.PI, true);
        this.ctx.closePath();
        this.ctx.fill();

        // Kapı panelleri
        this.ctx.fillStyle = '#2a1810';
        for(let i = 0; i < 2; i++) {
            this.ctx.fillRect(
                doorX + i * (doorWidth/2) + 5,
                doorY + 10,
                doorWidth/2 - 10,
                doorHeight * 0.75
            );
        }

        // Kapı detayları
        this.ctx.fillStyle = '#1a0800';
        for(let i = 0; i < 2; i++) {
            for(let j = 0; j < 3; j++) {
                this.ctx.fillRect(
                    doorX + (i * doorWidth/2) + doorWidth * 0.15,
                    doorY + doorHeight * (0.2 + j * 0.25),
                    doorWidth * 0.15,
                    doorHeight * 0.15
                );
            }
        }

        // Kapı kulpları
        this.ctx.fillStyle = '#B8860B';
        this.ctx.beginPath();
        this.ctx.arc(doorX + doorWidth * 0.25, doorY + doorHeight * 0.5, 8, 0, Math.PI * 2);
        this.ctx.arc(doorX + doorWidth * 0.75, doorY + doorHeight * 0.5, 8, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.restore();
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
        if (healthContainer) {
            healthContainer.remove();
        }

        const waveStatus = document.getElementById('waveStatus');
        if (waveStatus) {
            waveStatus.style.display = 'none';
        }

        // Game Over ekranı - ilk aşama
        const gameOverScreen = document.createElement('div');
        gameOverScreen.className = 'game-over-screen';
        gameOverScreen.innerHTML = `
            <div class="game-over-content">
                <h1>Game Over!</h1>
                <p>Player: ${this.nickname}</p>
                <p>Wave: ${this.waveManager.currentWave}</p>
                <p>Final Score: ${this.score}</p>
                <p id="saveStatus">Skor kaydediliyor...</p>
                <div id="gameOverLeaderboard" style="display: none">
                    <h2>High Scores</h2>
                    <ul id="gameOverScoresList"></ul>
                    <button class="restart-button">Play Again</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(gameOverScreen);

        // Skoru MongoDB'ye kaydet
        fetch('/api/score', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nickname: this.nickname,
                score: this.score
            })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    document.getElementById('saveStatus').style.color = 'red';
                    document.getElementById('saveStatus').textContent = `Hata: ${err.details || err.error}`;
                    throw new Error(`Skor kaydetme hatası: ${err.details || err.error}`);
                });
            }
            return response.json();
        })
        .then(data => {
            document.getElementById('saveStatus').style.color = 'green';
            document.getElementById('saveStatus').textContent = `Skor başarıyla kaydedildi!`;
            
            // Leaderboard'u göster ve güncelle
            const leaderboardDiv = document.getElementById('gameOverLeaderboard');
            leaderboardDiv.style.display = 'block';
            
            return fetch('/api/leaderboard');
        })
        .then(response => response.json())
        .then(scores => {
            const leaderboardList = document.getElementById('gameOverScoresList');
            leaderboardList.innerHTML = scores
                .map((score, index) => `
                    <li class="${score.nickname === this.nickname ? 'current-player' : ''}">
                        ${index + 1}. ${score.nickname} - ${score.highScore} 
                        <span class="score-date">
                            (${new Date(score.lastPlayed).toLocaleDateString()})
                        </span>
                    </li>
                `).join('');
            
            console.log('Leaderboard güncellendi:', scores);
        })
        .catch(error => {
            console.error('Skor işleme hatası:', error);
            document.getElementById('saveStatus').style.color = 'red';
            document.getElementById('saveStatus').textContent = `Hata: ${error.message}`;
        });

        // Restart butonu
        const restartButton = gameOverScreen.querySelector('.restart-button');
        if (restartButton) {
            restartButton.addEventListener('click', () => {
                window.location.reload();
            });
        }
    }
}

