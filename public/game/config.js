// Oyun sabitleri ve konfigürasyonu - v1.1
export const GAME_CONFIG = {
    VERSION: '1.1', // Versiyon kontrolü için
    CANVAS_PADDING: 20,
    CASTLE_X: 50,
    CASTLE_WIDTH: 100,
    INITIAL_LIVES: 3,
    ARROW_SPEED: 20,
    BOSS_SPEED: 2,
    SPAWN_DELAY: 2000,
    INITIAL_WAVE: 1,
    
    // Player ayarları
    PLAYER: {
        WIDTH: 40,
        HEIGHT: 60,
        X: 100,
        INITIAL_DAMAGE: 35,
        INITIAL_ATTACK_SPEED: 1000,
        INITIAL_CRIT_CHANCE: 0.10,
        INITIAL_CRIT_DAMAGE: 1.8,
        INITIAL_MULTI_SHOT: 1,
        INITIAL_ARROWS: 1
    },
    
    // Enemy ayarları
    ENEMY: {
        WIDTH: 40,
        HEIGHT: 40,
        BASE_HEALTH: 80,
        BASE_DAMAGE: 15,
        BASE_SPEED: 3,
        HEALTH_INCREMENT: 8,
        SPEED_INCREMENT: 0.02,
        BOSS_HEALTH_MULTIPLIER: 8,
        BOSS_SPEED_MULTIPLIER: 0.3,
        BOSS_SIZE_MULTIPLIER: 2.5,
        BOSS_DAMAGE_MULTIPLIER: 2.5,
        
        // Animasyon değerleri
        NORMAL: {
            AMPLITUDE: {
                MIN: 3,
                MAX: 8
            },
            FREQUENCY: {
                MIN: 0.02,
                MAX: 0.04
            },
            WAVE_TIME_SPEED: 0.1
        },
        BOSS: {
            AMPLITUDE: 4,
            FREQUENCY: 0.01,
            WAVE_TIME_SPEED: 0.05
        }
    },
    
    // Wave ayarları
    WAVE: {
        INITIAL_ENEMIES: 3,
        ENEMIES_INCREMENT: 1,
        BOSS_EVERY_N_WAVES: 5,
        SPAWN_INTERVAL: 2400,
        SPAWN_INTERVAL_DECREASE: 25
    },

    // Kart sistemi
    CARDS: {
        OPTIONS_PER_WAVE: 3,
        RARITY_CHANCES: {
            COMMON: 0.60,
            RARE: 0.25,
            EPIC: 0.12,
            LEGENDARY: 0.03
        },
        UPGRADES: {
            DAMAGE: {
                COMMON: 1.08,
                RARE: 1.15,
                EPIC: 1.25,
                LEGENDARY: 1.40
            },
            ATTACK_SPEED: {
                COMMON: 0.98,
                RARE: 0.95,
                EPIC: 0.92,
                LEGENDARY: 0.88
            },
            CRIT_CHANCE: {
                COMMON: 0.02,
                RARE: 0.04,
                EPIC: 0.06,
                LEGENDARY: 0.10
            },
            CRIT_DAMAGE: {
                COMMON: 0.05,
                RARE: 0.10,
                EPIC: 0.15,
                LEGENDARY: 0.20
            },
            MULTI_SHOT: {
                COMMON: 1,
                RARE: 1,
                EPIC: 1,
                LEGENDARY: 2
            }
        }
    },

    // Para sistemi
    CURRENCY: {
        INITIAL: 100,
        KILL_REWARD: {
            NORMAL: 10,
            BOSS: 100
        },
        WAVE_COMPLETION: 50
    },

    // Kart maliyetleri
    CARD_COSTS: {
        COMMON: 30,
        RARE: 80,
        EPIC: 150,
        LEGENDARY: 300
    },

    // Ceza kartları
    PENALTY_CARDS: {
        ATTACK_SPEED_DECREASE: {
            name: "Slow Curse",
            description: "Attack speed decreased by 10%",
            effect: { type: 'attackSpeed', value: 1.1 }
        },
        DAMAGE_DECREASE: {
            name: "Weakness Curse",
            description: "Damage decreased by 15%",
            effect: { type: 'damage', value: 0.85 }
        },
        CRIT_CHANCE_DECREASE: {
            name: "Unlucky Curse",
            description: "Critical chance decreased by 5%",
            effect: { type: 'criticalChance', value: -0.05 }
        },
        ARROW_SPEED_DECREASE: {
            name: "Heavy Arrows",
            description: "Arrow speed decreased by 20%",
            effect: { type: 'arrowSpeed', value: 0.8 }
        }
    }
};

console.log('Game Config Version:', GAME_CONFIG.VERSION);
console.log('Enemy Base Speed:', GAME_CONFIG.ENEMY.BASE_SPEED);

// Geriye uyumluluk için ayrı exportlar
export const PLAYER_CONFIG = GAME_CONFIG.PLAYER;
export const ENEMY_CONFIG = GAME_CONFIG.ENEMY; 