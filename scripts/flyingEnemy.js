export default class FlyingEnemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
      super(scene, x, y, "enemy_flying"); // Usa el sprite que queráis (ej. bola de pinchos)

      scene.add.existing(this);
      scene.physics.add.existing(this);

      this.body.setAllowGravity(false); // No queremos que se caiga
      this.setImmovable(true); // Para que el jugador no lo empuje al chocarç

      this.body.moves = false; // Para que solo se mueva con el tween y no por fisicas

      this.health = 2;

      // Creamos la animación de movimiento infinito
      scene.tweens.add({
        targets: this,
        y: y + 150, // Posición final a la que llegará
        duration: 2000, // Tiempo que tarda en llegar (2 segundos)
        yoyo: true, // Al llegar al final, vuelve al origen automáticamente
        loop: -1, // Bucle infinito
        //ease: "Sine.easeInOut", // Hace que suavice la velocidad en los giros (como un péndulo)
      });

      this.createAnimation();
      this.play(this.idleAnim, true)
    }

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

    createAnimation(){

      this.idleAnim = {};
      this.idleAnim.key = "enemy2_idle";
      this.idleAnim.frames = this.scene.anims.generateFrameNames('spr_enemy2', {
        prefix: 'enemy2_idle',
        start: 1,
        end: 2,
      });
      this.idleAnim.frameRate = 8;
      this.idleAnim.repeat = -1;
      this.scene.anims.create(this.idleAnim);
    }
}