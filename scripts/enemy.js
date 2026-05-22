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
        //si recibe daño pero no muere, hace un efecto de parpadeo
        else {
          // 1. Lo teñimos de rojo puro (Hex: 0xff0000)
          this.setTint(0xff0000);

          // 2. Creamos el efecto de parpadeo rápido con un Tween
          this.scene.tweens.add({
            targets: this,
            alpha: 0.2, // Baja la opacidad al 20% (casi invisible)
            duration: 60, // Súper rápido: 60 milisegundos por trayecto
            yoyo: true, // Va del 100% al 20% y vuelve al 100%
            repeat: 3, // Repite el ciclo 3 veces (4 parpadeos en total)
            onComplete: () => {
              // 3. Al terminar, nos aseguramos de limpiar el tinte y restaurar el alpha
              this.clearTint();
              this.setAlpha(1);
            },
          });
        }
    }
}