export class Arrow {
    constructor(x, y, target, speed = 10) {
        this.x = x;
        this.y = y;
        this.target = target;
        this.speed = speed;
        this.width = 10;
        this.height = 4;
        this.isActive = true;

        // Düşmanın son bilinen konumunu sakla
        this.targetX = target ? target.x : x;
        this.targetY = target ? target.y : y;
    }

    update() {
        if (!this.isActive) return;

        // Eğer hedef hala yaşıyorsa hedefin pozisyonunu güncelle
        if (this.target) {
            this.targetX = this.target.x;
            this.targetY = this.target.y;
        }

        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;

            // Ok hedefin konumuna ulaştığında kaybolsun
            if (distance < this.speed) {
                this.isActive = false;
            }
        }
    }

    draw(ctx) {
        if (!this.isActive) return;

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(this.x, this.y - this.height / 2, this.width, this.height);
    }
}
