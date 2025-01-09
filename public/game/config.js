// Oyun sabitleri ve konfigürasyonu
export const GAME_CONFIG = {
    CANVAS_PADDING: 20,
    INITIAL_LIVES: 10,
    INITIAL_WAVE: 1,
    SPAWN_DELAY: 2000,
    CASTLE_X: 100,
    CASTLE_WIDTH: 50,
    ENEMY_SPEED: 3,         // Temel düşman hızı
    BOSS_SPEED: 2,          // Boss hızı
    ARROW_SPEED: 15         // Ok hızı
};

export const PLAYER_CONFIG = {
    X: 200,
    WIDTH: 40,
    HEIGHT: 40,
    INITIAL_DAMAGE: 5,
    INITIAL_ATTACK_SPEED: 1000,
    INITIAL_ARROWS: 1
};

export const ENEMY_CONFIG = {
    WIDTH: 40,
    HEIGHT: 40,
    BASE_HEALTH: 10,
    BASE_SPEED: GAME_CONFIG.ENEMY_SPEED,  // Temel düşman hızını buradan al
    BASE_DAMAGE: 1,
    MAX_HEALTH_MULTIPLIER: 10,
    MAX_SPEED_MULTIPLIER: 2,
    MAX_DAMAGE_MULTIPLIER: 5
}; 