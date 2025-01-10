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

        // Hedefin son konumunu kaydet
        this.targetFinalX = target.x + target.width / 2;
        this.targetFinalY = target.y + target.height / 2;

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

    continueForward() {
        // Hedef öldüğünde son konumunu güncelle
        if (this.target) {
            this.targetFinalX = this.target.x + this.target.width / 2;
            this.targetFinalY = this.target.y + this.target.height / 2;
        }
        this.target = null;
    }

    update() {
        if (!this.isActive) return;

        // Okun yeni konumunu hesapla
        const nextX = this.x + this.velocityX;
        const nextY = this.y + this.velocityY;

        if (this.target === null) {
            // Hedef yoksa, son konuma yaklaştık mı kontrol et
            const dx = this.targetFinalX - this.x;
            const dy = this.targetFinalY - this.y;
            const distanceToTarget = Math.sqrt(dx * dx + dy * dy);

            // Eğer ok hedefin son konumunu geçtiyse
            const dotProduct = dx * this.velocityX + dy * this.velocityY;
            if (dotProduct < 0) {
                // Ok hedefi geçti, deaktive et
                this.isActive = false;
                return;
            }

            if (distanceToTarget < this.speed) {
                // Hedefe ulaştık, oku deaktive et
                this.isActive = false;
                return;
            }
        }

        // Oku hareket ettir
        this.x = nextX;
        this.y = nextY;
    }

    draw(ctx) {
        if (!this.isActive) return;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // Ok gövdesi (daha ince)
        const shaftWidth = 12;
        const shaftHeight = 2;
        ctx.fillStyle = this.critical ? '#FFD700' : '#D3D3D3';
        ctx.fillRect(0, -shaftHeight/2, shaftWidth, shaftHeight);

        // Ok ucu (daha büyük ve üçgen)
        ctx.beginPath();
        ctx.fillStyle = this.critical ? '#FFA500' : '#A0A0A0';
        ctx.moveTo(shaftWidth - 2, -4);  // Uç başlangıcı biraz içeriden
        ctx.lineTo(shaftWidth + 6, 0);   // Uç noktası
        ctx.lineTo(shaftWidth - 2, 4);   // Diğer kenar
        ctx.closePath();
        ctx.fill();

        // Ok tüyleri
        ctx.fillStyle = this.critical ? '#FFD700' : '#FFFFFF';
        
        // Sol tüy
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-4, -3);
        ctx.lineTo(4, -3);
        ctx.closePath();
        ctx.fill();

        // Sağ tüy
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-4, 3);
        ctx.lineTo(4, 3);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }
}
