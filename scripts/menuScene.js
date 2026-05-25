export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {

    }

    create() {

        this.add.text(800, 300, 'SUPER JUEGAZO', {
            fontSize: '64px',
            fill: '#ffffff',
            fontFamily: 'monospace'
        }).setOrigin(0.5);

        let playBtn = this.add.text(800, 500, 'JUGAR', {
            fontSize: '32px',
            fill: '#000000',
            fontFamily: 'monospace'
        }).setOrigin(0.5).setInteractive(); // activar o no funciona

        // para que el boton cambie de color cuando tiene el cursor encima
        playBtn.on('pointerover', () => playBtn.setColor('#ffff00'));
        playBtn.on('pointerout', () => playBtn.setColor('#000000'));

        playBtn.on('pointerdown', () => {
            this.scene.start('EscenaBase', {level:1});
        });
    }
}