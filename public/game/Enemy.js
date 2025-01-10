import { GAME_CONFIG } from './config.js';

export class Enemy {
    constructor(canvas, wave) {
        this.width = GAME_CONFIG.ENEMY.WIDTH;
        this.height = GAME_CONFIG.ENEMY.HEIGHT;
        this.x = canvas.width - this.width;
        this.y = Math.random() * (canvas.height - 140) + 50;
        
        // Boss wave kontrolü
        this.isBoss = wave % 5 === 0;
        
        if (this.isBoss) {
            // Boss özellikleri
            this.width *= 3;
            this.height *= 3;
            this.health = GAME_CONFIG.ENEMY.BASE_HEALTH * 15;
            this.speedX = Math.max(-18, -GAME_CONFIG.BOSS_SPEED);
            this.damage = GAME_CONFIG.ENEMY.BASE_DAMAGE * 3;
            this.amplitude = 2;
            this.frequency = 0.005;
        } else {
            const sizeMultiplier = 1 + (wave * 0.1);
            this.health = GAME_CONFIG.ENEMY.BASE_HEALTH * sizeMultiplier;
            this.speedX = Math.max(-18, -GAME_CONFIG.ENEMY.BASE_SPEED);
            this.damage = GAME_CONFIG.ENEMY.BASE_DAMAGE * sizeMultiplier;
            this.amplitude = Math.random() * 4 + 2;
            this.frequency = Math.random() * 0.02 + 0.01;
        }
        
        this.maxHealth = this.health;
        this.time = Math.random() * Math.PI * 2;
        this.initialY = this.y;
    }

    draw(ctx) {
        if (this.isBoss) {
            // Boss çizimi
            ctx.fillStyle = '#800000';
            
            // Ana gövde
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // Zırh detayları
            ctx.fillStyle = '#600000';
            // Üst zırh
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x + this.width, this.y);
            ctx.lineTo(this.x + this.width - 20, this.y + 20);
            ctx.lineTo(this.x + 20, this.y + 20);
            ctx.fill();
            
            // Alt zırh
            ctx.beginPath();
            ctx.moveTo(this.x, this.y + this.height);
            ctx.lineTo(this.x + this.width, this.y + this.height);
            ctx.lineTo(this.x + this.width - 20, this.y + this.height - 20);
            ctx.lineTo(this.x + 20, this.y + this.height - 20);
            ctx.fill();
            
            // Göz
            ctx.fillStyle = '#FF0000';
            const eyeSize = this.width * 0.2;
            ctx.beginPath();
            ctx.arc(this.x + this.width * 0.7, this.y + this.height * 0.4, eyeSize, 0, Math.PI * 2);
            ctx.fill();
            
            // Göz parıltısı
            ctx.fillStyle = '#FF6666';
            ctx.beginPath();
            ctx.arc(this.x + this.width * 0.7 + 5, this.y + this.height * 0.4 - 5, eyeSize * 0.3, 0, Math.PI * 2);
            ctx.fill();
            
            // Dişler
            ctx.fillStyle = '#FFFFFF';
            const toothWidth = this.width * 0.1;
            const toothHeight = this.height * 0.15;
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.moveTo(this.x + this.width * 0.4 + i * toothWidth * 1.5, this.y + this.height * 0.7);
                ctx.lineTo(this.x + this.width * 0.4 + i * toothWidth * 1.5 + toothWidth, this.y + this.height * 0.7);
                ctx.lineTo(this.x + this.width * 0.4 + i * toothWidth * 1.5 + toothWidth/2, this.y + this.height * 0.7 + toothHeight);
                ctx.fill();
            }
        } else {
            // Normal düşman çizimi
            ctx.fillStyle = '#FF0000';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }

        // Can barı arkaplanı
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(this.x, this.y - 15, this.width, 8);
        
        // Mevcut can
        const healthPercentage = Math.max(0, Math.min(1, this.health / this.maxHealth));
        ctx.fillStyle = this.isBoss ? '#FFD700' : '#32CD32';
        ctx.fillRect(this.x, this.y - 15, this.width * healthPercentage, 8);
    }

    update() {
        this.x += this.speedX;
        this.time += this.isBoss ? 0.03 : 0.08;  // Boss daha yavaş sallanır
        this.y = this.initialY + Math.sin(this.time) * this.amplitude;
    }
} 