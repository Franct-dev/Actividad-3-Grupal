export default class EnemyPatrol extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        // Inicializamos el sprite con la imagen 'enemy'
        super(scene, x, y, 'enemy_patrol');

        // Lo añadimos al mundo visual y al sistema de físicas dinámicas
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Configuraciones físicas básicas para un enemigo que camina
        this.setOrigin(0.5, 0.5); // Centramos el origen para que gire bien al cambiar de lado
        this.setCollideWorldBounds(true); // Que no se salga de los límites del mapa
        this.body.setBounce(0); // Evitamos que rebote como una pelota

        // Variables de movimiento tipo Goomba
        this.speed = 80;       // Velocidad de caminata
        this.direction = -1;   // -1 = Izquierda, 1 = Derecha (empieza yendo a la izquierda)
        this.health = 2;       // Puntos de vida

        // Le aplicamos la velocidad inicial
        this.setVelocityX(this.speed * this.direction);
 
        this.createAnimation();
        this.play(this.idleAnim, true)
    }

    // Al activar 'runChildUpdate: true' en el grupo, Phaser ejecutará esto automáticamente cada frame
    update() {
        // DETECCIÓN DE PAREDES: 
        // Si el cuerpo del enemigo está bloqueado a la izquierda o tocando algo a la izquierda...
        if (this.body.blocked.left || this.body.touching.left) {
            this.direction = 1;       // Cambia dirección a la derecha
            this.setFlipX(true);      // Voltea el sprite horizontalmente
        } 
        // Si está bloqueado o tocando algo a la derecha...
        else if (this.body.blocked.right || this.body.touching.right) {
            this.direction = -1;      // Cambia dirección a la izquierda
            this.setFlipX(false);     // Vuelve el sprite a su posición original
        }

        // Aplicamos la velocidad constantemente en la dirección que toque
        this.setVelocityX(this.speed * this.direction);
    }

    takeDamage(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.destroy(); // Se elimina a sí mismo del juego al quedarse sin vida
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

      createAnimation() {

      this.idleAnim = {};
      this.idleAnim.key = "enemy_idle";
      this.idleAnim.frames = this.scene.anims.generateFrameNames('spr_enemy', {
        prefix: 'enemy_idle',
        start: 1,
        end: 2,
      });
      this.idleAnim.frameRate = 8;
      this.idleAnim.repeat = -1;
      this.scene.anims.create(this.idleAnim);
    }
}