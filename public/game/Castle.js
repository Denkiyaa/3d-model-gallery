export class Castle {
    constructor(ctx, config) {
        this.ctx = ctx;
        this.config = config;
    }

    draw(groundY) {
        // Castle dimensions
        const castleX = this.config.CASTLE_X;
        const castleWidth = this.config.CASTLE_WIDTH;
        const castleHeight = this.ctx.canvas.height * 0.4;
        const doorWidth = castleWidth * 0.25;
        const doorHeight = castleHeight * 0.5;

        // Draw main castle wall with bricks
        this.drawMainWall(castleX, groundY, castleWidth, castleHeight);

        // Draw large metal gate
        this.drawGate(castleX + (castleWidth - doorWidth) / 2, groundY - doorHeight, doorWidth, doorHeight);
    }

    drawMainWall(x, y, width, height) {
        // Main wall with a slight skew for isometric perspective
        const skewX = width * 0.2;

        this.ctx.fillStyle = '#4a4a4a';
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x + width, y);
        this.ctx.lineTo(x + width + skewX, y - height);
        this.ctx.lineTo(x + skewX, y - height);
        this.ctx.closePath();
        this.ctx.fill();

        // Draw bricks
        this.drawBricks(x, y, width, height, skewX);
    }

    drawBricks(x, y, width, height, skewX) {
        const brickHeight = height / 10;
        const brickWidth = width / 5;

        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 5; col++) {
                const offsetX = (row % 2 === 0) ? 0 : brickWidth / 2;
                const brickX = x + col * brickWidth + offsetX;
                const brickY = y - row * brickHeight;

                this.ctx.fillStyle = '#3a3a3a';
                this.ctx.fillRect(brickX, brickY, brickWidth - 2, brickHeight - 2);
            }
        }
    }

    drawGate(x, y, width, height) {
        // Castle gate
        this.ctx.fillStyle = '#2a2a2a';
        this.ctx.fillRect(x, y, width, height);

        // Gate details
        this.ctx.fillStyle = '#1a1a1a';
        for (let i = 0; i < 4; i++) {
            const barWidth = width * 0.1;
            const barX = x + i * (barWidth + width * 0.05);
            this.ctx.fillRect(barX, y, barWidth, height);
        }

        // Metal bolts
        this.ctx.fillStyle = '#555';
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 3; j++) {
                const boltX = x + (i * (width / 4)) + (width / 8);
                const boltY = y + (j * (height / 3)) + (height / 6);
                this.ctx.beginPath();
                this.ctx.arc(boltX, boltY, 3, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
    }
}
