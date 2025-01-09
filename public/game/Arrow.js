import { GAME_CONFIG } from './config.js';

export class Arrow {
    constructor(x, y, target) {
        this.x = x;
        this.y = y;
        this.target = target;
        this.width = 10;
        this.height = 4;
        this.speed = GAME_CONFIG.ARROW_SPEED;
        this.isActive = true;

        // Hedefin merkez noktasını hesapla
        const targetCenterX = target.x + target.width / 2;
        const targetCenterY = target.y + target.height / 2;

        // Okun hedefe ulaşma süresini hesapla
        const dx = targetCenterX - x;
        const dy = targetCenterY - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const relativeSpeed = Math.abs(target.speedX) / this.speed;
        const adjustedSpeed = this.speed + (relativeSpeed * this.speed);
        const timeToHit = distance / adjustedSpeed;

        // Düşmanın tahmin edilen konumu
        const futureX = targetCenterX + (target.speedX * timeToHit);
        const futureY = targetCenterY + (Math.cos(target.time) * target.amplitude * target.frequency * timeToHit);

        // Açıyı hesapla
        let angle = Math.atan2(futureY - y, futureX - x);
        angle = Math.max(-Math.PI/2, Math.min(Math.PI/2, angle));

        // Hız vektörlerini hesapla
        this.velocityX = Math.cos(angle) * this.speed;
        this.velocityY = Math.sin(angle) * this.speed;
        this.angle = angle;
    }

    update() {
        if (!this.isActive) return;

        // Sabit yönde hareket et
        this.x += this.velocityX;
        this.y += this.velocityY;

        // Ekran dışına çıktıysa deaktive et
        if (this.x < 0 || this.x > window.innerWidth || 
            this.y < 0 || this.y > window.innerHeight) {
            this.isActive = false;
        }
    }

    draw(ctx) {
        if (!this.isActive) return;

        // Ok çizimini döndür
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // Ok gövdesi
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, -this.height/2, this.width, this.height);

        ctx.restore();
    }
}
