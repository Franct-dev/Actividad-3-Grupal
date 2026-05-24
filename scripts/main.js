import EscenaBase from './escenaBase.js';
import HUDScene from './HUDScene.js';
import MenuScene from './menuScene.js';

// Configuración general del juego
const config = {
    type: Phaser.AUTO,
    width: 64*25, //para solo cambiar el numero de patrones configurado en Tiled
    height: 64*14,
    backgroundColor: '#3a3c55',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 1300 },
            debug: false
        }
    },
    //importante mantener el orden de las escenas para que primero cargue EscenaBase
    scene: [MenuScene, EscenaBase, HUDScene]
};

const game = new Phaser.Game(config);
