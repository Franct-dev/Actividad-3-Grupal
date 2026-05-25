export default class FlyingEnemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
      super(scene, x, y, "enemy_flying");

      scene.add.existing(this);
      scene.physics.add.existing(this);

      this.body.setAllowGravity(false);
      this.setImmovable(true); // para que el jugador no lo empuje al chocarç

      this.body.moves = false; // para que solo se mueva con el tween y no por fisicas

      this.health = 2;

      scene.tweens.add({
        targets: this,
        y: y + 150,
        duration: 2000,
        yoyo: true, // al llegar al final, vuelve al origen automáticamente
        loop: -1,
      });

      this.createAnimation();
      this.play(this.idleAnim, true)
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

    createAnimation(){

      this.idleAnim = {};
      this.idleAnim.key = "enemy2_idle";
      this.idleAnim.frames = this.scene.anims.generateFrameNames('spr_enemy2', {
        prefix: 'enemy2_idle',
        start: 1,
        end: 5,
      });
      this.idleAnim.frameRate = 8;
      this.idleAnim.repeat = -1;
      this.scene.anims.create(this.idleAnim);
    }
}