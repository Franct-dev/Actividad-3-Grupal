export default class EnemyPatrol extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {

        super(scene, x, y, 'enemy_patrol');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setOrigin(0.5, 0.5);
        this.setCollideWorldBounds(true);
        this.body.setBounce(0);

        this.speed = 80;
        this.direction = -1;
        this.health = 2;

        this.setVelocityX(this.speed * this.direction);
 
        this.createAnimation();
        this.play(this.idleAnim, true)
    }

    // l activar runChildUpdate en el grupo, se ejecuta el update automaticamente cada frame
    update() {
  
        // deteccion de paredes a izquierda y derecha

        if (this.body.blocked.left || this.body.touching.left) {
            this.direction = 1;       // Cambia dirección a la derecha
            this.setFlipX(true);      // Voltea el sprite horizontalmente
        } 
        else if (this.body.blocked.right || this.body.touching.right) {
            this.direction = -1;      // Cambia dirección a la izquierda
            this.setFlipX(false);     // Vuelve el sprite a su posición original
        }

        this.setVelocityX(this.speed * this.direction);
    }

    takeDamage(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.destroy();
        }
        else {
          this.setTint(0xff0000);

          this.scene.tweens.add({
            targets: this,
            alpha: 0.2,
            duration: 60,
            yoyo: true,
            repeat: 3,
            onComplete: () => {
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