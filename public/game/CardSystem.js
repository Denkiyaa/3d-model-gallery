// Kart sistemi
export class CardSystem {
    constructor(game) {
        this.game = game;
        this.isChoosingCard = false;
    }

    showCardSelection() {
        this.isChoosingCard = true;
        
        // Varolan kart seçim ekranını temizle
        const existingCardSelection = document.querySelector('.card-selection');
        if (existingCardSelection) {
            existingCardSelection.remove();
        }
        
        const cardSelection = document.createElement('div');
        cardSelection.className = 'card-selection';
        cardSelection.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.8);
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            color: white;
            z-index: 1000;
        `;
        
        cardSelection.innerHTML = `
            <h2>Wave ${this.game.waveManager.currentWave} Tamamlandı!</h2>
            <h3>Geliştirme Kartı Seç</h3>
            <div class="cards" style="display: flex; gap: 20px; justify-content: center;">
                <div class="card" style="cursor: pointer; padding: 20px; background: #444; border-radius: 5px;">Hasar +1</div>
                <div class="card" style="cursor: pointer; padding: 20px; background: #444; border-radius: 5px;">Saldırı Hızı +10%</div>
                <div class="card" style="cursor: pointer; padding: 20px; background: #444; border-radius: 5px;">Çoklu Ok +1</div>
            </div>
        `;
        
        const cards = cardSelection.querySelectorAll('.card');
        cards.forEach(card => {
            card.addEventListener('mouseover', () => {
                card.style.background = '#666';
            });
            card.addEventListener('mouseout', () => {
                card.style.background = '#444';
            });
        });
        
        cards[0].addEventListener('click', () => this.selectCard('damage'));
        cards[1].addEventListener('click', () => this.selectCard('attackSpeed'));
        cards[2].addEventListener('click', () => this.selectCard('multiShot'));
        
        document.body.appendChild(cardSelection);
    }

    selectCard(type) {
        switch(type) {
            case 'damage':
                this.game.player.damage += 1;
                break;
            case 'attackSpeed':
                this.game.player.attackSpeed *= 0.9;
                break;
            case 'multiShot':
                this.game.player.multipleArrows += 1;
                break;
        }

        const cardSelection = document.querySelector('.card-selection');
        if (cardSelection) {
            cardSelection.remove();
        }
        
        this.isChoosingCard = false;
        this.game.waveManager.startNewWave();
    }
} 