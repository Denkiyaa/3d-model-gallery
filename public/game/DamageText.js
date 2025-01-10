export class DamageText {
    constructor(x, y, damage, isCritical = false) {
        this.x = x;
        this.y = y;
        this.damage = damage;
        this.isCritical = isCritical;
        this.life = 1.0;  // 0-1 arası yaşam süresi
        this.velocity = {
            x: (Math.random() - 0.5) * 2,  // Sağa veya sola rastgele hareket
            y: -3  // Yukarı doğru hareket
        };
    }

    update() {
        // Hareket
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.velocity.y += 0.1;  // Yerçekimi etkisi
        
        // Yaşam süresi azalır
        this.life -= 0.02;
        
        return this.life > 0;
    }

    draw(ctx) {
        ctx.save();
        
        // Yazı stili
        ctx.font = `${this.isCritical ? 'bold ' : ''}${20 + (this.isCritical ? 5 : 0)}px Arial`;
        ctx.textAlign = 'center';
        
        // Gölge efekti
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        // Renk ve opaklık
        if (this.isCritical) {
            ctx.fillStyle = `rgba(255,0,0,${this.life})`;
            // Kritik vuruş parlaması
            const glow = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, 20);
            glow.addColorStop(0, `rgba(255,0,0,${this.life * 0.3})`);
            glow.addColorStop(1, 'rgba(255,0,0,0)');
            ctx.fillStyle = glow;
            ctx.fillRect(this.x - 20, this.y - 20, 40, 40);
            ctx.fillStyle = `rgba(255,0,0,${this.life})`;
        } else {
            ctx.fillStyle = `rgba(255,255,255,${this.life})`;
        }

        // Hasar miktarını yaz
        ctx.fillText(
            `${this.damage}${this.isCritical ? '!' : ''}`, 
            this.x, 
            this.y
        );

        ctx.restore();
    }
} 