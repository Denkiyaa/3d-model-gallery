import { ENEMY_CONFIG, GAME_CONFIG } from './config.js';

export class Enemy {
    constructor(canvas, wave) {
        this.baseWidth = ENEMY_CONFIG.WIDTH;
        this.baseHeight = ENEMY_CONFIG.HEIGHT;
        this.x = canvas.width - this.baseWidth;
        this.y = Math.random() * (canvas.height - 140) + 50;
        
        // Düşman zorluk seviyesine göre boyutlandırma
        const sizeMultiplier = 1 + (wave * 0.1); // Her wave'de %10 artış
        this.width = this.baseWidth * sizeMultiplier;
        this.height = this.baseHeight * sizeMultiplier;
        
        this.health = ENEMY_CONFIG.BASE_HEALTH * sizeMultiplier; // Canı da boyuta göre ayarlayalım
        this.maxHealth = this.health;
        this.speedX = -ENEMY_CONFIG.BASE_SPEED;
        this.speedY = 0;
        
        // Rastgele hareket için değişkenler
        this.amplitude = Math.random() * 4 + 2; // Genliği artırdık (2-6 arası)
        this.frequency = Math.random() * 0.02 + 0.01; // Frekans aynı
        this.time = Math.random() * Math.PI * 2;
        
        // Başlangıç Y pozisyonunu sakla
        this.initialY = this.y;
        
        this.damage = ENEMY_CONFIG.BASE_DAMAGE * sizeMultiplier; // Hasarı da boyuta göre ayarlayalım
        
        this.isBoss = false;
        this.isElite = false;
    }

    draw(ctx) {
        // Düşman gövdesi
        ctx.fillStyle = this.isBoss ? '#800000' : 
                       this.isElite ? '#FF4500' : '#FF0000';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Can barı arkaplanı
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(this.x, this.y - 10, this.width, 5);
        
        // Mevcut can
        ctx.fillStyle = this.isBoss ? '#FFD700' : 
                       this.isElite ? '#00FF00' : '#32CD32';
        const healthPercentage = this.health / this.maxHealth;
        ctx.fillRect(this.x, this.y - 10, this.width * healthPercentage, 5);
    }

    update() {
        // Yatay hareket
        this.x += this.speedX;
        
        // Sinüs dalgası kullanarak yukarı-aşağı hareket
        this.time += 0.08; // Zamanı biraz daha hızlı artırdık (0.05'ten 0.08'e)
        this.y = this.initialY + Math.sin(this.time) * this.amplitude;
    }
} 