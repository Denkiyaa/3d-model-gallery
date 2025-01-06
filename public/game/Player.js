import { PLAYER_CONFIG } from './config.js';
import { Arrow } from './Arrow.js';

export class Player {
    constructor(canvas) {
        this.canvas = canvas;
        this.width = PLAYER_CONFIG.WIDTH;
        this.height = PLAYER_CONFIG.HEIGHT;
        this.x = PLAYER_CONFIG.X;
        this.y = canvas.height / 2 - this.height / 2;
        
        this.damage = PLAYER_CONFIG.INITIAL_DAMAGE;
        this.attackSpeed = PLAYER_CONFIG.INITIAL_ATTACK_SPEED;
        this.multipleArrows = PLAYER_CONFIG.INITIAL_ARROWS;
        this.criticalChance = 0.1;
        this.lastAttackTime = 0;
    }

    update() {
        // Mouse takibi için
        const mouseY = this.canvas.height / 2; // Varsayılan pozisyon
        
        // Smooth hareket
        this.y += (mouseY - this.y) * 0.1;
        
        // Canvas sınırları içinde kal
        this.y = Math.max(0, Math.min(this.y, this.canvas.height - this.height));
        
        // Otomatik saldırı
        if (this.game && this.game.enemies.length > 0) {
            this.attack(this.game.enemies, this.game.arrows);
        }
    }

    draw(ctx) {
        ctx.fillStyle = '#0000FF';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    attack(enemies, arrows) {
        const currentTime = Date.now();
        if (currentTime - this.lastAttackTime >= this.attackSpeed) {
            const target = enemies[0];
            if (target) {
                for (let i = 0; i < this.multipleArrows; i++) {
                    const spread = (i - (this.multipleArrows - 1) / 2) * 10;
                    const arrow = new Arrow(
                        this.x + this.width,
                        this.y + this.height / 2 - 2 + spread,
                        target,
                        10,
                        Math.random() < this.criticalChance
                    );
                    arrows.push(arrow);
                }
                this.lastAttackTime = currentTime;
            }
        }
    }
} 