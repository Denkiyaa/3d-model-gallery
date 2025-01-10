// Oyun sabitleri ve konfigürasyonu
export const GAME_CONFIG = {
    CANVAS_PADDING: 20,
    CASTLE_X: 50,
    CASTLE_WIDTH: 100,
    INITIAL_LIVES: 3,
    ARROW_SPEED: 10,
    BOSS_SPEED: 2,
    SPAWN_DELAY: 2000,
    INITIAL_WAVE: 1,
    
    // Player ayarları
    PLAYER: {
        WIDTH: 40,
        HEIGHT: 60,
        X: 100,
        INITIAL_DAMAGE: 25,
        INITIAL_ATTACK_SPEED: 1300,
        INITIAL_CRIT_CHANCE: 0.08,
        INITIAL_CRIT_DAMAGE: 1.5,
        INITIAL_MULTI_SHOT: 1,
        INITIAL_ARROWS: 1
    },
    
    // Enemy ayarları
    ENEMY: {
        WIDTH: 40,
        HEIGHT: 40,
        BASE_HEALTH: 65,
        BASE_DAMAGE: 10,
        BASE_SPEED: 0.65,
        HEALTH_INCREMENT: 6,
        SPEED_INCREMENT: 0.03,
        BOSS_HEALTH_MULTIPLIER: 3.0,
        BOSS_SPEED_MULTIPLIER: 0.4
    },
    
    // Wave ayarları
    WAVE: {
        INITIAL_ENEMIES: 2,
        ENEMIES_INCREMENT: 1,
        BOSS_EVERY_N_WAVES: 5,
        SPAWN_INTERVAL: 2800,
        SPAWN_INTERVAL_DECREASE: 30
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
    }
};

// Geriye uyumluluk için ayrı exportlar
export const PLAYER_CONFIG = GAME_CONFIG.PLAYER;
export const ENEMY_CONFIG = GAME_CONFIG.ENEMY; 