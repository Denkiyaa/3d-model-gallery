import { GAME_CONFIG } from './config.js';
import { Arrow } from './Arrow.js';

export class Player {
    constructor(canvas) {
        this.canvas = canvas;
        this.width = GAME_CONFIG.PLAYER.WIDTH;
        this.height = GAME_CONFIG.PLAYER.HEIGHT;
        this.x = GAME_CONFIG.PLAYER.X;
        this.y = canvas.height / 2 - this.height / 2;
        
        this.damage = GAME_CONFIG.PLAYER.INITIAL_DAMAGE;
        this.attackSpeed = GAME_CONFIG.PLAYER.INITIAL_ATTACK_SPEED;
        this.multipleArrows = GAME_CONFIG.PLAYER.INITIAL_ARROWS;
        this.criticalChance = GAME_CONFIG.PLAYER.INITIAL_CRIT_CHANCE;
        this.lastAttackTime = 0;
        this.arrowSpeed = GAME_CONFIG.ARROW_SPEED;
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
                const arrowCount = Math.min(this.multipleArrows, 5);
                for (let i = 0; i < arrowCount; i++) {
                    const spread = (i - (arrowCount - 1) / 2) * 10;
                    const arrow = new Arrow(
                        this.x + this.width,
                        this.y + this.height / 2 - 2 + spread,
                        target,
                        this.arrowSpeed,
                        Math.random() < this.criticalChance
                    );
                    arrows.push(arrow);
                }
                this.lastAttackTime = currentTime;
            }
        }
    }

    shoot(target) {
        const currentTime = Date.now();
        if (currentTime - this.lastAttackTime >= this.attackSpeed) {
            const arrows = [];
            const arrowCount = Math.min(this.multipleArrows, 5);
            for (let i = 0; i < arrowCount; i++) {
                const spread = (i - (arrowCount - 1) / 2) * 10;
                const arrow = new Arrow(
                    this.x + this.width,
                    this.y + this.height / 2 - 2 + spread,
                    target,
                    this.arrowSpeed,
                    Math.random() < this.criticalChance
                );
                arrows.push(arrow);
            }
            this.lastAttackTime = currentTime;
            return arrows;
        }
        return [];
    }
} 