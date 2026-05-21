export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
        // aqui se puede cargar un fondo chulo o musica
        //this.load.image('menu_bg', 'assets/tu_fondo_menu.png'); 
    }

    create() {
        // añadir un fondo o un texto de título enorme
        this.add.text(800, 300, 'SUPER JUEGOAZO', {
            fontSize: '64px',
            fill: '#ffffff',
            fontFamily: 'monospace'
        }).setOrigin(0.5);

        // añadir un boton de jugar
        let playBtn = this.add.text(800, 500, 'JUGAR', {
            fontSize: '32px',
            fill: '#000000',
            fontFamily: 'monospace'
        }).setOrigin(0.5).setInteractive(); // activar o no funciona

        // para que el boton cambie de color cuando tiene el cursor encima
        playBtn.on('pointerover', () => playBtn.setColor('#ffff00'));
        playBtn.on('pointerout', () => playBtn.setColor('#000000'));

        // cuando se hace click en el boton, se pasa a la escena base
        playBtn.on('pointerdown', () => {
            this.scene.start('EscenaBase');
        });
    }
}