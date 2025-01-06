export class Arrow {
    constructor(x, y, target, speed = 10, critical = false) {
        this.x = x;
        this.y = y;
        this.target = target;
        this.speed = speed;
        this.critical = critical;
        this.width = 10;
        this.height = 4;
    }

    update() {
        // Ok hedefine doğru hareket eder
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
        }
    }

    draw(ctx) {
        ctx.save();
        
        // Okun yönünü hesapla
        const angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
        
        // Oku döndür
        ctx.translate(this.x, this.y);
        ctx.rotate(angle);
        
        // Oku çiz
        ctx.fillStyle = this.critical ? '#FFD700' : '#FFFFFF';
        ctx.fillRect(0, -this.height / 2, this.width, this.height);
        
        ctx.restore();
    }
} 