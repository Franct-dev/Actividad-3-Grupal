export default class HUDScene extends Phaser.Scene {
    constructor() {
        super({ key: 'HUDScene' });
    }

    create() {
        
        //Texto Puntuacion
        this.scoreText = this.add.text(20, 60, 'PUNTUACIÓN: 0', {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'Calibri'
        });

        // registrar un evento para actualizar el texto cada vez que cambien los puntos
        this.registry.events.on('changedata-score', (parent, newValue) => {
            // Esta función se ejecuta SOLA cada vez que haces un this.registry.set('score', ...)
            this.scoreText.setText('PUNTUACIÓN: ' + newValue);
        });

        // //Texto tiempo restante
        // this.txtTime = this.add.text(20, 20, 'TIEMPO: 60', {
        //     fontSize: '32px',
        //     fill: '#ffffff',
        //     fontFamily: 'Calibri'
        // });

        // //registrar un evento para actualizar el texto cada vez que cambie el tiempo
        // this.registry.events.on('changedata-totalTime', (parent, newValue) => {
        //     this.txtTime.setText('TIEMPO: ' + newValue);
        // });
        
        //Texto vida
        this.txtHealth = this.add.text(20, 100, 'VIDA: 3', {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'Calibri'
        });

        //registrar un evento para actualizar el texto cada vez que cambie la vida
        this.registry.events.on('changedata-health', (parent, newValue) => {
            this.txtHealth.setText('VIDA: ' + newValue);
        });

    }
}