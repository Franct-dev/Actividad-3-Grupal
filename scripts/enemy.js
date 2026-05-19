export default class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        // 'enemy' debe estar precargado en la escena
        super(scene, x, y, 'enemy');

        // Añadir el objeto al mundo y darle físicas
        scene.add.existing(this);
        //añadir true para que sea un cuerpo estático
        scene.physics.add.existing(this, true);

        // Variables propias del enemigo (ej. vida, dirección)
        this.health = 1;
    }

    // Este método se ejecuta automáticamente si el grupo lo actualiza
    takeDamage(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.destroy(); // Se elimina a sí mismo del juego
        }
    }
}