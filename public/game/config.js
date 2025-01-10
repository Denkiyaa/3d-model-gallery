// Oyun sabitleri ve konfigürasyonu
export const GAME_CONFIG = {
    CANVAS_PADDING: 20,
    CASTLE_X: 50,
    CASTLE_WIDTH: 100,
    INITIAL_LIVES: 3,
    
    // Wave ayarları
    WAVE: {
        INITIAL_ENEMIES: 3,        // İlk wave'deki düşman sayısı
        ENEMIES_INCREMENT: 1,      // Her wave'de eklenecek düşman sayısı
        BOSS_EVERY_N_WAVES: 5,     // Kaç wave'de bir boss gelecek
        SPAWN_INTERVAL: 2000,      // Düşmanlar arası süre (ms)
        SPAWN_INTERVAL_DECREASE: 50 // Her wave'de azalacak spawn süresi
    },

    // Düşman ayarları
    ENEMY: {
        BASE_HEALTH: 100,          // Temel düşman canı
        HEALTH_INCREMENT: 20,      // Her wave'de artacak can
        BASE_SPEED: 1,             // Temel düşman hızı
        SPEED_INCREMENT: 0.1,      // Her wave'de artacak hız
        BOSS_HEALTH_MULTIPLIER: 3, // Boss can çarpanı
        BOSS_SPEED_MULTIPLIER: 0.7 // Boss yavaş ama güçlü
    },

    // Oyuncu ayarları
    PLAYER: {
        INITIAL_DAMAGE: 25,        // Başlangıç hasarı (4 ok ile öldürme)
        INITIAL_ATTACK_SPEED: 1,   // Saniyede 1 ok
        INITIAL_CRIT_CHANCE: 0.1,  // %10 kritik şans
        INITIAL_MULTI_SHOT: 1      // Tek ok
    },

    // Kart sistemi
    CARDS: {
        OPTIONS_PER_WAVE: 3,       // Her wave sonrası sunulan kart sayısı
        RARITY_CHANCES: {
            COMMON: 0.60,          // %60
            RARE: 0.25,           // %25
            EPIC: 0.10,           // %10
            LEGENDARY: 0.05       // %5
        },
        UPGRADES: {
            DAMAGE: {
                COMMON: 1.2,      // %20 artış
                RARE: 1.4,        // %40 artış
                EPIC: 1.6,        // %60 artış
                LEGENDARY: 2.0    // %100 artış
            },
            ATTACK_SPEED: {
                COMMON: 1.15,     // %15 artış
                RARE: 1.3,        // %30 artış
                EPIC: 1.5,        // %50 artış
                LEGENDARY: 1.8    // %80 artış
            },
            CRIT_CHANCE: {
                COMMON: 0.05,     // +%5
                RARE: 0.10,       // +%10
                EPIC: 0.15,       // +%15
                LEGENDARY: 0.25   // +%25
            },
            MULTI_SHOT: {
                COMMON: 1,        // +1 ok
                RARE: 1,          // +1 ok
                EPIC: 2,          // +2 ok
                LEGENDARY: 3      // +3 ok
            }
        }
    }
}; 