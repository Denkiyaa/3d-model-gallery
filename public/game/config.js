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
        INITIAL_ATTACK_SPEED: 1000,
        INITIAL_CRIT_CHANCE: 0.10,
        INITIAL_MULTI_SHOT: 1,
        INITIAL_ARROWS: 1
    },
    
    // Enemy ayarları
    ENEMY: {
        WIDTH: 40,
        HEIGHT: 40,
        BASE_HEALTH: 90,
        BASE_DAMAGE: 8,
        BASE_SPEED: 0.4,
        HEALTH_INCREMENT: 15,
        SPEED_INCREMENT: 0.08,
        BOSS_HEALTH_MULTIPLIER: 2.5,
        BOSS_SPEED_MULTIPLIER: 0.2
    },
    
    // Wave ayarları
    WAVE: {
        INITIAL_ENEMIES: 3,        // İlk wave'deki düşman sayısı
        ENEMIES_INCREMENT: 1,      // Her wave'de eklenecek düşman sayısı
        BOSS_EVERY_N_WAVES: 5,     // Kaç wave'de bir boss gelecek
        SPAWN_INTERVAL: 2500,      // Düşmanlar arası süre (ms)
        SPAWN_INTERVAL_DECREASE: 40 // Her wave'de azalacak spawn süresi
    },

    // Kart sistemi
    CARDS: {
        OPTIONS_PER_WAVE: 3,       // Her wave sonrası sunulan kart sayısı
        RARITY_CHANCES: {
            COMMON: 0.65,          // %65
            RARE: 0.25,           // %25
            EPIC: 0.08,           // %8
            LEGENDARY: 0.02       // %2
        },
        UPGRADES: {
            DAMAGE: {
                COMMON: 1.15,      // %15 artış
                RARE: 1.30,        // %30 artış
                EPIC: 1.45,        // %45 artış
                LEGENDARY: 1.70    // %70 artış
            },
            ATTACK_SPEED: {
                COMMON: 0.95,     // %5 hızlanma
                RARE: 0.90,      // %10 hızlanma
                EPIC: 0.85,      // %15 hızlanma
                LEGENDARY: 0.80   // %20 hızlanma
            },
            CRIT_CHANCE: {
                COMMON: 0.05,     // +%5
                RARE: 0.08,       // +%8
                EPIC: 0.12,       // +%12
                LEGENDARY: 0.18    // +%18
            },
            MULTI_SHOT: {
                COMMON: 1,        // +1 ok
                RARE: 1,          // +1 ok
                EPIC: 1,          // +1 ok
                LEGENDARY: 2      // +2 ok
            }
        }
    }
};

// Geriye uyumluluk için ayrı exportlar
export const PLAYER_CONFIG = GAME_CONFIG.PLAYER;
export const ENEMY_CONFIG = GAME_CONFIG.ENEMY; 