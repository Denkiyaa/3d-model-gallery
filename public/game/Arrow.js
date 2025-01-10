import { GAME_CONFIG } from './config.js';

export class Arrow {
    constructor(x, y, target, speed, critical) {
        this.x = x;
        this.y = y;
        this.target = target;
        this.width = 10;
        this.height = 4;
        this.speed = speed || GAME_CONFIG.ARROW_SPEED;
        this.critical = critical;
        this.isActive = true;

        // Hedefin merkez noktasını hesapla
        const targetCenterX = target.x + target.width / 2;
        const targetCenterY = target.y + target.height / 2;

        // Okun hedefe ulaşma süresini hesapla
        const dx = targetCenterX - x;
        const dy = targetCenterY - y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Düşmanın hızını hesaba kat
        // Yatay hız bileşeni
        const horizontalSpeed = Math.abs(target.speedX);
        // Dikey hız bileşeni (sallanma hareketi)
        const verticalSpeed = target.amplitude * target.frequency;

        // Toplam hız vektörü
        const totalSpeed = Math.sqrt(horizontalSpeed * horizontalSpeed + verticalSpeed * verticalSpeed);
        
        // Hedefin hareket yönünü tahmin et
        const timeToHit = distance / (this.speed + totalSpeed);
        
        // Hedefin tahmin edilen konumu
        const predictedX = targetCenterX + (target.speedX * timeToHit);
        const predictedY = targetCenterY + (Math.sin(target.time + timeToHit * target.frequency) * target.amplitude);

        // Hedefleme açısını hesapla
        const aimAngle = Math.atan2(predictedY - y, predictedX - x);

        // Okun hız bileşenlerini hesapla
        this.velocityX = Math.cos(aimAngle) * this.speed;
        this.velocityY = Math.sin(aimAngle) * this.speed;
        
        // Okun görsel açısı
        this.angle = aimAngle;
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

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // Ok gövdesi
        ctx.fillStyle = this.critical ? '#FFD700' : '#FFFFFF';
        ctx.fillRect(0, -this.height/2, this.width, this.height);

        // Ok ucu
        ctx.beginPath();
        ctx.moveTo(this.width, -this.height);
        ctx.lineTo(this.width + 5, 0);
        ctx.lineTo(this.width, this.height);
        ctx.fill();

        ctx.restore();
    }
}
