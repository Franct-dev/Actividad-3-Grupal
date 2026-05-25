export default class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'enemy');

        scene.add.existing(this);
        scene.physics.add.existing(this, true);

        this.health = 1;

        this.createAnimation();
        this.play(this.idleAnim, true)
    }

    takeDamage(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.destroy();
        } 
        //si recibe daño pero no muere, hace un efecto de parpadeo
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