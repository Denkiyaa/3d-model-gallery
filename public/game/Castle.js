export class Castle {
    constructor(ctx, config) {
        this.ctx = ctx;
        this.config = config;
    }

    draw(groundY) {
        const castleX = this.config.CASTLE_X;
        const castleWidth = this.config.CASTLE_WIDTH;
        const castleHeight = this.ctx.canvas.height * 0.8;

        // Kale gölgesi
        this.ctx.fillStyle = 'rgba(0,0,0,0.2)';
        this.ctx.beginPath();
        this.ctx.ellipse(
            castleX + castleWidth/2,
            groundY,
            castleWidth * 0.8,
            20,
            0, 0, Math.PI * 2
        );
        this.ctx.fill();

        // Ana duvar
        const wallGradient = this.ctx.createLinearGradient(castleX, 0, castleX + castleWidth, 0);
        wallGradient.addColorStop(0, '#4a4a4a');
        wallGradient.addColorStop(0.2, '#6a6a6a');
        wallGradient.addColorStop(0.8, '#6a6a6a');
        wallGradient.addColorStop(1, '#4a4a4a');
        
        this.ctx.fillStyle = wallGradient;
        this.ctx.fillRect(castleX, groundY - castleHeight, castleWidth, castleHeight);

        // Duvar taşları
        this.drawStones(castleX, groundY, castleWidth, castleHeight);

        // Kale kapısı
        this.drawDoor(castleX, groundY, castleWidth, castleHeight);
    }

    drawStones(castleX, groundY, castleWidth, castleHeight) {
        const stoneRows = 12;
        const stoneCols = 5;
        const stoneWidth = castleWidth / stoneCols;
        const stoneHeight = castleHeight / stoneRows;

        for(let row = 0; row < stoneRows; row++) {
            const offsetX = row % 2 ? stoneWidth/2 : 0;
            for(let col = 0; col < stoneCols + (row % 2 ? -1 : 0); col++) {
                const x = castleX + col * stoneWidth + offsetX;
                const y = groundY - castleHeight + row * stoneHeight;
                
                // Taş gölgesi
                this.ctx.fillStyle = 'rgba(0,0,0,0.1)';
                this.ctx.fillRect(x + 2, y + 2, stoneWidth - 4, stoneHeight - 4);
                
                // Taş çizgisi
                this.ctx.strokeStyle = 'rgba(0,0,0,0.2)';
                this.ctx.strokeRect(x + 2, y + 2, stoneWidth - 4, stoneHeight - 4);
            }
        }
    }

    drawDoor(castleX, groundY, castleWidth, castleHeight) {
        const doorWidth = castleWidth * 0.4;
        const doorHeight = castleHeight * 0.4;
        const doorX = castleX + (castleWidth - doorWidth) / 2;
        const doorY = groundY - doorHeight;
        const archHeight = doorHeight * 0.3;

        // Kapı kemeri gölgesi
        this.ctx.fillStyle = '#2a2a2a';
        this.ctx.beginPath();
        this.ctx.moveTo(doorX - 10, doorY);
        this.ctx.lineTo(doorX + doorWidth + 10, doorY);
        this.ctx.lineTo(doorX + doorWidth + 10, doorY + doorHeight - archHeight);
        this.ctx.arc(doorX + doorWidth/2, doorY + doorHeight - archHeight, 
                     doorWidth/2 + 10, 0, Math.PI, true);
        this.ctx.closePath();
        this.ctx.fill();

        // Kapı iç kısmı
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.beginPath();
        this.ctx.moveTo(doorX, doorY);
        this.ctx.lineTo(doorX + doorWidth, doorY);
        this.ctx.lineTo(doorX + doorWidth, doorY + doorHeight - archHeight);
        this.ctx.arc(doorX + doorWidth/2, doorY + doorHeight - archHeight, 
                     doorWidth/2, 0, Math.PI, true);
        this.ctx.closePath();
        this.ctx.fill();

        this.drawDoorPanels(doorX, doorY, doorWidth, doorHeight, archHeight);
        this.drawDoorHandles(doorX, doorY, doorWidth, doorHeight);
    }

    drawDoorPanels(doorX, doorY, doorWidth, doorHeight, archHeight) {
        const woodGradient = this.ctx.createLinearGradient(doorX, doorY, doorX, doorY + doorHeight);
        woodGradient.addColorStop(0, '#3a2820');
        woodGradient.addColorStop(0.5, '#2a1810');
        woodGradient.addColorStop(1, '#1a0800');

        for(let i = 0; i < 2; i++) {
            this.ctx.fillStyle = woodGradient;
            this.ctx.fillRect(
                doorX + i * (doorWidth/2) + 5,
                doorY + 5,
                doorWidth/2 - 10,
                doorHeight - archHeight - 10
            );

            // Metal çiviler
            this.ctx.fillStyle = '#B8860B';
            for(let j = 0; j < 3; j++) {
                for(let k = 0; k < 2; k++) {
                    this.ctx.beginPath();
                    this.ctx.arc(
                        doorX + (i * doorWidth/2) + doorWidth/4 + (k * doorWidth/4) - doorWidth/8,
                        doorY + doorHeight * (0.2 + j * 0.25),
                        4, 0, Math.PI * 2
                    );
                    this.ctx.fill();
                }
            }
        }
    }

    drawDoorHandles(doorX, doorY, doorWidth, doorHeight) {
        const handleGradient = this.ctx.createRadialGradient(
            doorX + doorWidth * 0.25, doorY + doorHeight * 0.5, 0,
            doorX + doorWidth * 0.25, doorY + doorHeight * 0.5, 10
        );
        handleGradient.addColorStop(0, '#FFD700');
        handleGradient.addColorStop(1, '#B8860B');

        this.ctx.fillStyle = handleGradient;
        this.ctx.beginPath();
        this.ctx.arc(doorX + doorWidth * 0.25, doorY + doorHeight * 0.4, 8, 0, Math.PI * 2);
        this.ctx.arc(doorX + doorWidth * 0.75, doorY + doorHeight * 0.4, 8, 0, Math.PI * 2);
        this.ctx.fill();
    }
} 