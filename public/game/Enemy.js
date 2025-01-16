import { GAME_CONFIG } from './config.js';

export class Enemy {
    constructor(canvas, wave) {
        this.width = GAME_CONFIG.ENEMY.WIDTH;
        this.height = GAME_CONFIG.ENEMY.HEIGHT;
        this.x = canvas.width - this.width;
        this.y = Math.random() * (canvas.height - 140) + 50;
        
        // Boss wave kontrolü
        this.isBoss = wave % 5 === 0;
        
        // Debug için hız hesaplama detayları
        console.log('Wave:', wave);
        console.log('Base Speed Config:', GAME_CONFIG.ENEMY.BASE_SPEED);
        
        // Temel hız hesapla (wave'e göre artan)
        const baseSpeed = GAME_CONFIG.ENEMY.BASE_SPEED * (1 + wave * GAME_CONFIG.ENEMY.SPEED_INCREMENT);
        console.log('Calculated Base Speed:', baseSpeed);
        
        if (this.isBoss) {
            // Boss özellikleri
            this.width *= GAME_CONFIG.ENEMY.BOSS_SIZE_MULTIPLIER;
            this.height *= GAME_CONFIG.ENEMY.BOSS_SIZE_MULTIPLIER;
            this.health = GAME_CONFIG.ENEMY.BASE_HEALTH * GAME_CONFIG.ENEMY.BOSS_HEALTH_MULTIPLIER * (1 + wave * 0.1);
            this.speedX = -baseSpeed * GAME_CONFIG.ENEMY.BOSS_SPEED_MULTIPLIER;
            this.damage = GAME_CONFIG.ENEMY.BASE_DAMAGE * GAME_CONFIG.ENEMY.BOSS_DAMAGE_MULTIPLIER;
            this.amplitude = GAME_CONFIG.ENEMY.BOSS.AMPLITUDE;
            this.frequency = GAME_CONFIG.ENEMY.BOSS.FREQUENCY;
            
            console.log('Boss Speed:', this.speedX);
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
            
            console.log('Normal Enemy Speed:', this.speedX);
        }
        
        this.maxHealth = this.health;
        this.time = Math.random() * Math.PI * 2;
        this.initialY = this.y;
        this.isActive = true;
    }

    draw(ctx) {
        if (!this.isActive) return;

        // Önce gölgeyi çiz
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(
            this.x + this.width/2,
            this.y + this.height + 5,
            this.width * 0.6,
            this.height * 0.2,
            0, 0, Math.PI * 2
        );
        ctx.fill();

        // Boss veya normal düşman çizimi
        if (this.isBoss) {
            this.drawBoss(ctx);
        } else {
            this.drawNormalEnemy(ctx);
        }
        
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
        // Gölge
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(
            this.x + this.width/2,
            this.y + this.height + 5,
            this.width * 0.6,
            this.height * 0.2,
            0, 0, Math.PI * 2
        );
        ctx.fill();

        // Gövde (daha parlak kırmızı)
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Kafa (daha koyu)
        ctx.fillStyle = '#CC0000';
        ctx.fillRect(this.x, this.y, this.width, this.height * 0.4);

        // Gözler (daha büyük)
        ctx.fillStyle = '#FFFFFF';
        const eyeWidth = this.width * 0.25;
        const eyeHeight = this.height * 0.2;
        ctx.fillRect(this.x + this.width * 0.2, this.y + this.height * 0.15, eyeWidth, eyeHeight);
        ctx.fillRect(this.x + this.width * 0.6, this.y + this.height * 0.15, eyeWidth, eyeHeight);

        // Göz bebekleri (daha belirgin)
        ctx.fillStyle = '#000000';
        const pupilSize = eyeWidth * 0.6;
        ctx.fillRect(this.x + this.width * 0.25, this.y + this.height * 0.17, pupilSize, pupilSize);
        ctx.fillRect(this.x + this.width * 0.65, this.y + this.height * 0.17, pupilSize, pupilSize);
    }

    drawBoss(ctx) {
        // Gölge
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath();
        ctx.ellipse(
            this.x + this.width/2,
            this.y + this.height + 10,
            this.width * 0.7,
            this.height * 0.25,
            0, 0, Math.PI * 2
        );
        ctx.fill();

        // Gövde (daha parlak ve koyu kırmızı)
        ctx.fillStyle = '#8B0000';
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Kafa bölgesi (daha belirgin)
        ctx.fillStyle = '#660000';
        ctx.fillRect(this.x, this.y, this.width, this.height * 0.4);

        // Boynuzlar (daha parlak altın)
        ctx.fillStyle = '#FFD700';
        // Sol boynuz
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - this.width * 0.3, this.y - this.height * 0.3);
        ctx.lineTo(this.x + this.width * 0.2, this.y);
        ctx.fill();
        // Sağ boynuz
        ctx.beginPath();
        ctx.moveTo(this.x + this.width * 0.8, this.y);
        ctx.lineTo(this.x + this.width * 1.1, this.y - this.height * 0.3);
        ctx.lineTo(this.x + this.width, this.y);
        ctx.fill();

        // Gözler (daha parlak kırmızı)
        ctx.fillStyle = '#FF0000';
        const eyeSize = this.width * 0.2;
        ctx.fillRect(this.x + this.width * 0.2, this.y + this.height * 0.15, eyeSize, eyeSize);
        ctx.fillRect(this.x + this.width * 0.65, this.y + this.height * 0.15, eyeSize, eyeSize);

        // Göz parlaması (daha belirgin)
        ctx.fillStyle = '#FF6666';
        const glowSize = eyeSize * 0.5;
        ctx.fillRect(this.x + this.width * 0.22, this.y + this.height * 0.17, glowSize, glowSize);
        ctx.fillRect(this.x + this.width * 0.67, this.y + this.height * 0.17, glowSize, glowSize);
    }

    update() {
        if (!this.isActive) return;
        
        this.x += this.speedX;
        this.time += this.isBoss ? 
            GAME_CONFIG.ENEMY.BOSS.WAVE_TIME_SPEED : 
            GAME_CONFIG.ENEMY.NORMAL.WAVE_TIME_SPEED;
        this.y = this.initialY + Math.sin(this.time) * this.amplitude;
    }
} 