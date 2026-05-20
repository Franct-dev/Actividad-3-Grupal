export default class FlyingEnemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
      super(scene, x, y, "enemy_flying"); // Usa el sprite que queráis (ej. bola de pinchos)

      scene.add.existing(this);
      scene.physics.add.existing(this);

      this.body.setAllowGravity(false); // ¡Clave! No queremos que se caiga
      this.setImmovable(true); // Para que el jugador no lo empuje al chocar

      this.health = 1;

      // Creamos la animación de movimiento infinito
      scene.tweens.add({
        targets: this,
        y: y + 150, // Posición final a la que llegará
        duration: 2000, // Tiempo que tarda en llegar (2 segundos)
        yoyo: true, // Al llegar al final, vuelve al origen automáticamente
        loop: -1, // Bucle infinito
        ease: "Sine.easeInOut", // Hace que suavice la velocidad en los giros (como un péndulo)
      });
    }

    takeDamage(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.destroy(); // Se elimina a sí mismo del juego
        }
    }
}