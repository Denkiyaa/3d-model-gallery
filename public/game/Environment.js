export class Environment {
    constructor(ctx) {
        this.ctx = ctx;
        this.initializeEnvironment();
        this.createGradients();
    }

    createGradients() {
        // Gökyüzü gradienti - daha açık mavi
        this.skyGradient = this.ctx.createLinearGradient(0, 0, 0, this.ctx.canvas.height);
        this.skyGradient.addColorStop(0, '#4FB4E9');    // Biraz daha canlı mavi
        this.skyGradient.addColorStop(1, '#A5D4F0');    // Daha açık mavi
        
        // Zemin gradienti - daha canlı yeşil
        this.groundGradient = this.ctx.createLinearGradient(0, this.ctx.canvas.height * 0.5, 0, this.ctx.canvas.height);
        this.groundGradient.addColorStop(0, '#4CAF50');   // Canlı yeşil
        this.groundGradient.addColorStop(1, '#388E3C');   // Koyu yeşil
    }

    initializeEnvironment() {
        // Ağaçları başlat - daha yukarı ve dağınık
        this.trees = Array(10).fill().map(() => ({
            x: Math.random() * this.ctx.canvas.width,
            y: Math.random() * (this.ctx.canvas.height * 0.3) + this.ctx.canvas.height * 0.6, // 0.95'ten değişti
            type: Math.random() > 0.5 ? 0 : 1,
            size: 0.8 + Math.random() * 0.4,
            swayOffset: Math.random() * Math.PI * 2,
            color: {
                trunk: '#5D4037',
                leaf: '#4CAF50'
            }
        }));

        // Bulutları başlat
        this.clouds = Array(12).fill().map(() => ({
            x: Math.random() * this.ctx.canvas.width,
            y: Math.random() * (this.ctx.canvas.height * 0.3),
            size: Math.random() * 40 + 30,
            opacity: Math.random() * 0.2 + 0.8,  // Daha belirgin bulutlar
            speed: Math.random() * 0.1 + 0.05
        }));

        // Çimenleri başlat - daha yukarıya kadar
        this.grassPatches = Array(300).fill().map(() => ({  // Sayıyı artırdık
            x: Math.random() * this.ctx.canvas.width,
            y: Math.random() * (this.ctx.canvas.height * 0.6) + this.ctx.canvas.height * 0.4, // 0.5'ten 0.4'e
            height: Math.random() * 8 + 4,
            color: this.getRandomGreenShade()
        }));

        // Taşları başlat - daha yukarıya kadar çıkabilsin
        this.rocks = Array(25).fill().map(() => ({
            x: Math.random() * this.ctx.canvas.width,
            y: Math.random() * (this.ctx.canvas.height * 0.4) + this.ctx.canvas.height * 0.5,
            size: Math.random() * 15 + 5,  // Daha küçük taşlar
            color: this.getRandomRockColor()
        }));
    }

    getRandomGreenShade() {
        // Çimen renkleri daha canlı
        const hue = 120 + Math.random() * 10; // Yeşil tonu
        const saturation = 60 + Math.random() * 20; // Canlılık
        const lightness = 35 + Math.random() * 15; // Parlaklık
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }

    getRandomRockColor() {
        // Taşlar daha gri
        const shade = 180 + Math.random() * 30;
        return `rgb(${shade}, ${shade}, ${shade})`;
    }

    draw() {
        this.drawBackground();
        this.drawClouds();
        this.drawRocks();
        this.drawTrees();
        this.drawGrass();
    }

    drawBackground() {
        // Gökyüzü
        this.ctx.fillStyle = this.skyGradient;
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        
        // Zemin - biraz daha yukarı
        this.ctx.fillStyle = this.groundGradient;
        this.ctx.fillRect(0, this.ctx.canvas.height * 0.4,  // 0.5'ten 0.4'e
                         this.ctx.canvas.width, this.ctx.canvas.height * 0.6);
    }

    drawTrees() {
        this.trees.forEach(tree => {
            const sway = Math.sin(Date.now() * 0.001 + tree.swayOffset) * 3;

            if (tree.type === 0) {
                this.drawRoundTree(tree, sway);
            } else {
                this.drawPineTree(tree, sway);
            }

            // Yaprak gölgeleri
            this.drawTreeShadow(tree);
        });
    }

    drawRoundTree(tree, sway) {
        const leafSize = 50 * tree.size;
        const trunkWidth = 15 * tree.size;
        const trunkHeight = 70 * tree.size;

        // Gövde gölgesi ve ana gövde
        this.drawTreeTrunk(tree, trunkWidth, trunkHeight);

        // Yapraklar
        this.ctx.fillStyle = tree.color.leaf;
        for(let i = 0; i < 3; i++) {
            this.ctx.beginPath();
            this.ctx.arc(
                tree.x + sway * (i/3), 
                tree.y - leafSize * 0.8 * i, 
                leafSize * (1 - i * 0.2), 
                0, Math.PI * 2
            );
            this.ctx.fill();
        }
    }

    drawPineTree(tree, sway) {
        const leafSize = 80 * tree.size;
        const trunkWidth = 18 * tree.size;
        const trunkHeight = 80 * tree.size;

        this.ctx.save();
        this.ctx.translate(tree.x, tree.y);
        this.ctx.rotate(sway * 0.02);
        
        // Gövde gölgesi
        this.ctx.fillStyle = 'rgba(0,0,0,0.2)';
        this.ctx.fillRect(-trunkWidth/2 + 2, -trunkHeight, trunkWidth, trunkHeight);
        
        // Ana gövde
        this.ctx.fillStyle = tree.color.trunk;
        this.ctx.fillRect(-trunkWidth/2, -trunkHeight, trunkWidth, trunkHeight);
        
        // Üçgen yapraklar (3 katman)
        const layers = 3;
        for(let i = 0; i < layers; i++) {
            const layerSize = leafSize * (1.2 - i * 0.2);
            const layerHeight = trunkHeight * (0.6 + i * 0.3);
            
            // Yaprak gölgesi
            this.ctx.fillStyle = 'rgba(0,0,0,0.2)';
            this.ctx.beginPath();
            this.ctx.moveTo(-layerSize/2 + 2, -layerHeight + 2);
            this.ctx.lineTo(layerSize/2 + 2, -layerHeight + 2);
            this.ctx.lineTo(0, -layerHeight - layerSize + 2);
            this.ctx.closePath();
            this.ctx.fill();
            
            // Ana yapraklar
            this.ctx.fillStyle = tree.color.leaf;
            this.ctx.beginPath();
            this.ctx.moveTo(-layerSize/2, -layerHeight);
            this.ctx.lineTo(layerSize/2, -layerHeight);
            this.ctx.lineTo(0, -layerHeight - layerSize);
            this.ctx.closePath();
            this.ctx.fill();
        }
        
        this.ctx.restore();
    }

    drawTreeTrunk(tree, trunkWidth, trunkHeight) {
        // Gövde gölgesi
        this.ctx.fillStyle = 'rgba(0,0,0,0.2)';
        this.ctx.fillRect(tree.x - trunkWidth/2 + 2, tree.y, trunkWidth, trunkHeight);

        // Ana gövde
        this.ctx.fillStyle = tree.color.trunk;
        this.ctx.fillRect(tree.x - trunkWidth/2, tree.y, trunkWidth, trunkHeight);
    }

    drawTreeShadow(tree) {
        const leafSize = 50 * tree.size;
        const trunkHeight = tree.type === 0 ? 70 * tree.size : 40 * tree.size;
        
        this.ctx.fillStyle = 'rgba(0,0,0,0.1)';
        this.ctx.beginPath();
        this.ctx.ellipse(
            tree.x + leafSize/3, 
            tree.y + trunkHeight, 
            leafSize * 0.8, 
            leafSize * 0.3, 
            0, 0, Math.PI * 2
        );
        this.ctx.fill();
    }

    drawClouds() {
        this.clouds.forEach(cloud => {
            cloud.x += cloud.speed;
            if (cloud.x > this.ctx.canvas.width + 100) cloud.x = -100;

            this.ctx.fillStyle = `rgba(255, 255, 255, ${cloud.opacity})`;
            this.ctx.beginPath();
            this.ctx.arc(cloud.x, cloud.y, cloud.size, 0, Math.PI * 2);
            this.ctx.arc(cloud.x - cloud.size * 0.5, cloud.y, cloud.size * 0.6, 0, Math.PI * 2);
            this.ctx.arc(cloud.x + cloud.size * 0.5, cloud.y, cloud.size * 0.8, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    drawGrass() {
        this.grassPatches.forEach(grass => {
            // Çimen gölgesi
            this.ctx.strokeStyle = 'rgba(0,0,0,0.1)';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(grass.x + 1, grass.y);
            this.ctx.lineTo(grass.x - 1, grass.y - grass.height);
            this.ctx.stroke();

            // Ana çimen
            this.ctx.strokeStyle = grass.color;
            this.ctx.lineWidth = 1.5;
            this.ctx.beginPath();
            this.ctx.moveTo(grass.x, grass.y);
            this.ctx.lineTo(grass.x - 2, grass.y - grass.height);
            this.ctx.moveTo(grass.x, grass.y);
            this.ctx.lineTo(grass.x + 2, grass.y - grass.height);
            this.ctx.stroke();
        });
    }

    drawRocks() {
        this.rocks.forEach(rock => {
            this.ctx.fillStyle = rock.color;
            this.ctx.beginPath();
            this.ctx.ellipse(rock.x, rock.y, rock.size, rock.size * 0.7, 0, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
} 