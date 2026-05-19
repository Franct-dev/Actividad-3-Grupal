import EscenaBase from './escenaBase.js';

// Configuración general del juego
const config = {
    type: Phaser.AUTO,
    width: 64*25, //para solo cambiar el numero de patrones configurado en Tiled
    height: 64*14,
    backgroundColor: '#87CEEB',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 1300 },
            debug: false
        }
    },
    scene: [EscenaBase]
};

const game = new Phaser.Game(config);
