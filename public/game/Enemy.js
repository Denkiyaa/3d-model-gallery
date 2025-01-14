import { GAME_CONFIG } from './config.js';

export class Enemy {
    constructor(canvas, wave) {
        this.width = GAME_CONFIG.ENEMY.WIDTH;
        this.height = GAME_CONFIG.ENEMY.HEIGHT;
        this.x = canvas.width - this.width;
        this.y = Math.random() * (canvas.height - 140) + 50;
        
        // Boss wave kontrolü
        this.isBoss = wave % 5 === 0;
        
        // Temel hız hesapla (wave'e göre artan)
        const baseSpeed = GAME_CONFIG.ENEMY.BASE_SPEED * (1 + wave * GAME_CONFIG.ENEMY.SPEED_INCREMENT);
        
        if (this.isBoss) {
            // Boss özellikleri
            this.width *= GAME_CONFIG.ENEMY.BOSS_SIZE_MULTIPLIER;
            this.height *= GAME_CONFIG.ENEMY.BOSS_SIZE_MULTIPLIER;
            this.health = GAME_CONFIG.ENEMY.BASE_HEALTH * GAME_CONFIG.ENEMY.BOSS_HEALTH_MULTIPLIER * (1 + wave * 0.1);
            this.speedX = -baseSpeed * GAME_CONFIG.ENEMY.BOSS_SPEED_MULTIPLIER;
            this.damage = GAME_CONFIG.ENEMY.BASE_DAMAGE * GAME_CONFIG.ENEMY.BOSS_DAMAGE_MULTIPLIER;
            this.amplitude = GAME_CONFIG.ENEMY.BOSS.AMPLITUDE;
            this.frequency = GAME_CONFIG.ENEMY.BOSS.FREQUENCY;
            
            // Boss için ek kontroller
            this.isDying = false;
            this.deathAnimationFrame = 0;
            this.maxDeathFrames = 30; // Ölüm animasyonu için frame sayısı
        } else {
            const sizeMultiplier = 1 + (wave * 0.1);
            this.health = GAME_CONFIG.ENEMY.BASE_HEALTH * sizeMultiplier;
            this.speedX = -baseSpeed;
            this.damage = GAME_CONFIG.ENEMY.BASE_DAMAGE * sizeMultiplier;
            this.amplitude = Math.random() * 
                (GAME_CONFIG.ENEMY.NORMAL.AMPLITUDE.MAX - GAME_CONFIG.ENEMY.NORMAL.AMPLITUDE.MIN) + 
                GAME_CONFIG.ENEMY.NORMAL.AMPLITUDE.MIN;
            this.frequency = Math.random() * 
                (GAME_CONFIG.ENEMY.NORMAL.FREQUENCY.MAX - GAME_CONFIG.ENEMY.NORMAL.FREQUENCY.MIN) + 
                GAME_CONFIG.ENEMY.NORMAL.FREQUENCY.MIN;
        }
        
        this.maxHealth = this.health;
        this.time = Math.random() * Math.PI * 2;
        this.initialY = this.y;
        this.isActive = true;
    }

    draw(ctx) {
        if (!this.isActive) return;

        // Boss ölüm animasyonu
        if (this.isBoss && this.isDying) {
            const opacity = 1 - (this.deathAnimationFrame / this.maxDeathFrames);
            ctx.globalAlpha = opacity;
            this.drawBoss(ctx);
            ctx.globalAlpha = 1;
            return;
        }

        // Normal çizim
        this.drawBoss(ctx);
        
        // Can barı
        if (this.health > 0) {
            // Can barı arkaplanı
            ctx.fillStyle = '#FF0000';
            ctx.fillRect(this.x, this.y - 15, this.width, 8);
            
            // Mevcut can
            const healthPercentage = Math.max(0, Math.min(1, this.health / this.maxHealth));
            ctx.fillStyle = this.isBoss ? '#FFD700' : '#32CD32';
            ctx.fillRect(this.x, this.y - 15, this.width * healthPercentage, 8);
        }
    }

    drawNormalEnemy(ctx) {
        const centerX = this.x + this.width/2;
        const centerY = this.y + this.height/2;

        // Gövde (koyu kırmızı)
        ctx.fillStyle = '#8B0000';
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Kafa (daha basit)
        ctx.fillStyle = '#660000';
        ctx.fillRect(this.x, this.y, this.width, this.height * 0.4);

        // Gözler (beyaz arka plan)
        ctx.fillStyle = '#FFFFFF';
        const eyeWidth = this.width * 0.2;
        const eyeHeight = this.height * 0.15;
        ctx.fillRect(this.x + this.width * 0.2, this.y + this.height * 0.15, eyeWidth, eyeHeight);
        ctx.fillRect(this.x + this.width * 0.6, this.y + this.height * 0.15, eyeWidth, eyeHeight);

        // Göz bebekleri (siyah)
        ctx.fillStyle = '#000000';
        const pupilSize = eyeWidth * 0.5;
        ctx.fillRect(this.x + this.width * 0.25, this.y + this.height * 0.17, pupilSize, pupilSize);
        ctx.fillRect(this.x + this.width * 0.65, this.y + this.height * 0.17, pupilSize, pupilSize);

        // Kılıç (basit)
        ctx.strokeStyle = '#808080';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(this.x - 5, this.y + this.height * 0.5);
        ctx.lineTo(this.x + 15, this.y + this.height * 0.7);
        ctx.stroke();
    }

    drawBoss(ctx) {
        const centerX = this.x + this.width/2;
        const centerY = this.y + this.height/2;

        // Gövde (daha koyu kırmızı)
        ctx.fillStyle = '#4A0000';
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Kafa bölgesi
        ctx.fillStyle = '#2A0000';
        ctx.fillRect(this.x, this.y, this.width, this.height * 0.4);

        // Boynuzlar (üçgen)
        ctx.fillStyle = '#FFD700';
        // Sol boynuz
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - this.width * 0.2, this.y - this.height * 0.2);
        ctx.lineTo(this.x + this.width * 0.2, this.y);
        ctx.fill();
        // Sağ boynuz
        ctx.beginPath();
        ctx.moveTo(this.x + this.width * 0.8, this.y);
        ctx.lineTo(this.x + this.width * 1.0, this.y - this.height * 0.2);
        ctx.lineTo(this.x + this.width, this.y);
        ctx.fill();

        // Gözler (kırmızı)
        ctx.fillStyle = '#FF0000';
        const eyeSize = this.width * 0.15;
        ctx.fillRect(this.x + this.width * 0.2, this.y + this.height * 0.15, eyeSize, eyeSize);
        ctx.fillRect(this.x + this.width * 0.65, this.y + this.height * 0.15, eyeSize, eyeSize);

        // Göz parlaması
        ctx.fillStyle = '#FF6666';
        const glowSize = eyeSize * 0.4;
        ctx.fillRect(this.x + this.width * 0.22, this.y + this.height * 0.17, glowSize, glowSize);
        ctx.fillRect(this.x + this.width * 0.67, this.y + this.height * 0.17, glowSize, glowSize);

        // Büyük kılıç (altın)
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(this.x - 20, this.y + this.height * 0.4);
        ctx.lineTo(this.x + 30, this.y + this.height * 0.7);
        ctx.stroke();
    }

    update() {
        if (!this.isActive) return;

        if (this.isBoss && this.isDying) {
            this.deathAnimationFrame++;
            if (this.deathAnimationFrame >= this.maxDeathFrames) {
                this.isActive = false;
                return;
            }
        }
        
        this.x += this.speedX;
        this.time += this.isBoss ? 
            GAME_CONFIG.ENEMY.BOSS.WAVE_TIME_SPEED : 
            GAME_CONFIG.ENEMY.NORMAL.WAVE_TIME_SPEED;
        this.y = this.initialY + Math.sin(this.time) * this.amplitude;
    }

    startDeathAnimation() {
        if (this.isBoss && !this.isDying) {
            this.isDying = true;
            this.deathAnimationFrame = 0;
        }
    }
} 