import { GAME_CONFIG } from './config.js';

// Kart sistemi
export class CardSystem {
    constructor(game) {
        this.game = game;
        this.isChoosingCard = false;
        
        // Kart simgeleri
        this.CARD_ICONS = {
            damage: '🎯',
            attackSpeed: '⚡',
            multiShot: '🏹',
            critical: '✨',
            critDamage: '💥',    // Yeni simge
            arrowSpeed: '💨'  // Ok hızı için simge
        };
        
        // Card pool - kartları rarity'lerine göre grupla
        this.cardPool = {
            damage: [
                { name: 'Sharp Arrows', bonus: 1, description: 'Damage +1', rarity: 'common' },
                { name: 'Reinforced Arrows', bonus: 2, description: 'Damage +2', rarity: 'rare' },
                { name: 'Penetrating Arrows', bonus: 3, description: 'Damage +3', rarity: 'epic' },
                { name: 'Dragon Slayer Arrows', bonus: 5, description: 'Damage +5', rarity: 'legendary' }
            ],
            attackSpeed: [
                { name: 'Quick Draw', bonus: 0.97, description: 'Attack Speed +3%', rarity: 'common' },
                { name: 'Swift Shot', bonus: 0.95, description: 'Attack Speed +5%', rarity: 'rare' },
                { name: 'Lightning Strike', bonus: 0.92, description: 'Attack Speed +8%', rarity: 'epic' },
                { name: 'Time Bender', bonus: 0.88, description: 'Attack Speed +12%', rarity: 'legendary' }
            ],
            multiShot: [
                { name: 'Double Shot', bonus: 1, description: 'Arrows +1', rarity: 'rare' },
                { name: 'Triple Shot', bonus: 2, description: 'Arrows +2', rarity: 'epic' },
                { name: 'Arrow Storm', bonus: 3, description: 'Arrows +3', rarity: 'legendary' }
            ],
            critical: [
                { name: 'Precision Strike', bonus: 0.03, description: 'Critical Chance +3%', rarity: 'common' },
                { name: 'Deadly Aim', bonus: 0.05, description: 'Critical Chance +5%', rarity: 'rare' },
                { name: 'Master Marksman', bonus: 0.08, description: 'Critical Chance +8%', rarity: 'epic' },
                { name: 'Eagle Eye', bonus: 0.12, description: 'Critical Chance +12%', rarity: 'legendary' }
            ],
            arrowSpeed: [
                { name: 'Swift Arrows', bonus: 0.95, description: 'Arrow Speed +5%', rarity: 'common' },
                { name: 'Rapid Arrows', bonus: 0.90, description: 'Arrow Speed +10%', rarity: 'rare' },
                { name: 'Sonic Arrows', bonus: 0.85, description: 'Arrow Speed +15%', rarity: 'epic' },
                { name: 'Light Speed Arrows', bonus: 0.80, description: 'Arrow Speed +20%', rarity: 'legendary' }
            ],
            critDamage: [
                { name: 'Deadly Strike', bonus: 0.05, description: 'Critical Damage +5%', rarity: 'common' },
                { name: 'Lethal Force', bonus: 0.10, description: 'Critical Damage +10%', rarity: 'rare' },
                { name: 'Devastating Blow', bonus: 0.15, description: 'Critical Damage +15%', rarity: 'epic' },
                { name: 'Ultimate Impact', bonus: 0.20, description: 'Critical Damage +20%', rarity: 'legendary' }
            ]
        };

        this.penaltyCards = Object.values(GAME_CONFIG.PENALTY_CARDS);
    }

    showCardSelection() {
        this.isChoosingCard = true;
        
        const existingCardSelection = document.querySelector('.card-selection');
        if (existingCardSelection) {
            existingCardSelection.remove();
        }

        const cardSelection = document.createElement('div');
        cardSelection.className = 'card-selection';
        
        const selectedCards = this.getSelectedCards();
        
        cardSelection.innerHTML = `
            <div class="card-selection-content">
                <h2>${this.game.waveManager.currentWave % 5 === 0 ? 'Boss Wave Completed!' : 'Wave Completed!'}</h2>
                <div class="cards">
                    ${selectedCards.map(card => `
                        <div class="card ${card.rarity || 'common'}">
                            <h4>${card.name}</h4>
                            <p>${card.description}</p>
                            <div class="card-cost">
                                <span class="cost-value">${GAME_CONFIG.CARD_COSTS[card.rarity ? card.rarity.toUpperCase() : 'COMMON']}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <button class="skip-button">Skip (Random Penalty)</button>
            </div>
        `;

        document.body.appendChild(cardSelection);

        // Kart seçim olaylarını ekle
        const cards = cardSelection.querySelectorAll('.card');
        cards.forEach((cardElement, index) => {
            cardElement.addEventListener('click', () => this.handleCardSelection(selectedCards[index], cardSelection));
        });

        // Skip butonu olayını ekle
        const skipButton = cardSelection.querySelector('.skip-button');
        skipButton.addEventListener('click', () => this.handleSkip(cardSelection));
    }

    selectCard(card) {
        switch(card.type) {
            case 'damage':
                this.game.player.damage += card.bonus;
                break;
            case 'attackSpeed':
                this.game.player.attackSpeed = Math.max(100, this.game.player.attackSpeed * card.bonus);
                break;
            case 'multiShot':
                this.game.player.multipleArrows = Math.min(5, this.game.player.multipleArrows + card.bonus);
                break;
            case 'critical':
                this.game.player.criticalChance = Math.min(1, (this.game.player.criticalChance || 0) + card.bonus);
                break;
            case 'arrowSpeed':
                this.game.player.arrowSpeed = Math.max(5, this.game.player.arrowSpeed * card.bonus);
                break;
            case 'critDamage':
                this.game.player.criticalDamage = (this.game.player.criticalDamage || 1.5) + card.bonus;
                break;
        }

        const cardSelection = document.querySelector('.card-selection');
        if (cardSelection) {
            cardSelection.remove();
        }
        
        this.isChoosingCard = false;
        this.game.waveManager.startNewWave();
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    applyRandomPenalty() {
        const penalty = this.penaltyCards[Math.floor(Math.random() * this.penaltyCards.length)];
        
        // Ceza kartını göster
        const penaltyCard = document.createElement('div');
        penaltyCard.className = 'penalty-card';
        penaltyCard.innerHTML = `
            <div class="card penalty">
                <div class="card-icon">⚠️</div>
                <h4>${penalty.name}</h4>
                <p>${penalty.description}</p>
            </div>
        `;
        document.body.appendChild(penaltyCard);

        // Cezayı uygula
        const { type, value } = penalty.effect;
        switch(type) {
            case 'attackSpeed':
                this.game.player.attackSpeed *= value;
                break;
            case 'damage':
                this.game.player.damage *= value;
                break;
            case 'criticalChance':
                this.game.player.criticalChance = Math.max(0, (this.game.player.criticalChance || 0) + value);
                break;
            case 'arrowSpeed':
                this.game.player.arrowSpeed *= value;
                break;
        }

        // 3 saniye sonra kartı kaldır
        setTimeout(() => penaltyCard.remove(), 3000);
    }

    getSelectedCards() {
        const cardTypes = Object.keys(this.cardPool);
        const isBossWave = this.game.waveManager.currentWave % 5 === 0;
        
        let selectedTypes;
        if (isBossWave) {
            selectedTypes = ['multiShot'];
            const otherTypes = cardTypes.filter(type => type !== 'multiShot');
            const additionalTypes = this.shuffleArray(otherTypes).slice(0, 2);
            selectedTypes.push(...additionalTypes);
        } else {
            const availableTypes = cardTypes.filter(type => type !== 'multiShot');
            selectedTypes = this.shuffleArray(availableTypes).slice(0, 3);
        }
        
        return selectedTypes.map(type => {
            const cards = this.cardPool[type];
            const rand = Math.random();
            let selectedRarity;
            
            if (isBossWave) {
                if (rand < 0.40) selectedRarity = 'common';
                else if (rand < 0.75) selectedRarity = 'rare';
                else if (rand < 0.95) selectedRarity = 'epic';
                else selectedRarity = 'legendary';
            } else {
                if (rand < 0.65) selectedRarity = 'common';
                else if (rand < 0.90) selectedRarity = 'rare';
                else if (rand < 0.99) selectedRarity = 'epic';
                else selectedRarity = 'legendary';
            }

            const cardsOfRarity = cards.filter(card => card.rarity === selectedRarity);
            let availableCards = cardsOfRarity;
            
            if (cardsOfRarity.length === 0) {
                selectedRarity = 'common';
                availableCards = cards.filter(card => card.rarity === 'common');
            }

            const card = availableCards[Math.floor(Math.random() * availableCards.length)];
            return { ...card, type };
        });
    }

    handleCardSelection(card, cardSelection) {
        const cost = GAME_CONFIG.CARD_COSTS[card.rarity.toUpperCase()];
        if (this.game.currency >= cost) {
            this.game.currency -= cost;
            this.selectCard(card);
            cardSelection.remove();
            this.isChoosingCard = false;
            this.game.waveManager.startNewWave();
        } else {
            const cardElement = cardSelection.querySelector(`.card.${card.rarity}`);
            cardElement.classList.add('cannot-afford');
            setTimeout(() => cardElement.classList.remove('cannot-afford'), 500);
        }
    }

    handleSkip(cardSelection) {
        this.applyRandomPenalty();
        cardSelection.remove();
        this.isChoosingCard = false;
        this.game.waveManager.startNewWave();
    }
} 