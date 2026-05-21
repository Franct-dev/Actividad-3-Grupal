// Definimos una clase Jugador que extiende de Sprite con físicas arcade
export default class Jugador extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, jumpSound) {

    super(scene, x, y, 'player');

    this.scene = scene; // guardar una referencia a la escena

    // añadir sprite y fisicas
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);

    // guardar las teclas
    this.cursors = this.scene.input.keyboard.createCursorKeys();

    this.keys = this.scene.input.keyboard.addKeys({
      dash: Phaser.Input.Keyboard.KeyCodes.SHIFT,
      shoot: Phaser.Input.Keyboard.KeyCodes.Z,
    });

    // guardar una referencia al sonido de salto
    this.jumpSound = jumpSound;

    //DOBLE SALTO Y DASH

    this.doubleJumpAvailable = true;
    this.jumpFromFloorThisPress = false;
    this.dashAvailable = true;
    this.dashFramesTotal = 15;
    this.dashFramesCounter = 15;
    this.lastDirection = true; //True para left, false para right

    //VIDA

    this.health = 3;
    this.inKnockback = false;
    
    //DISPARO
    this.canShoot = true;
    this.bullets = this.scene.physics.add.group({allowGravity:false});

    // ANIMACIONES

    //Ciclo de andar
    this.walkAnim =  {}
    this.walkAnim.key = 'char_walk';
    this.walkAnim.frames = this.scene.anims.generateFrameNames('spr_character', {
        prefix: 'char_walk',
        start: 1,
        end: 2,
      });
    this.walkAnim.frameRate = 10;
    this.walkAnim.repeat = -1;
    this.scene.anims.create(this.walkAnim);

    //Idle
    this.idleAnim = {}
    this.idleAnim.key = 'char_idle';
    this.idleAnim.frames = this.scene.anims.generateFrameNames('spr_character', {
      prefix: 'char_idle',
      start: 1,
      end: 1,
    });
    this.idleAnim.frameRate = 10;
    this.idleAnim.repeat = -1;
    this.scene.anims.create(this.idleAnim);

    //Salto
    this.jumpAnim = {}
    this.jumpAnim.key = 'char_jump';
    this.jumpAnim.frames = this.scene.anims.generateFrameNames('spr_character', {
      prefix: 'char_jump',
      start: 1,
      end: 1,
    });
    this.jumpAnim.frameRate = 10;
    this.jumpAnim.repeat = -1;
    this.scene.anims.create(this.jumpAnim);
  }

  update() {

    if(this.inKnockback === true) return;

    //velocidad y fuerza de salto
    const speed = 200;        
    const jumpForce = 650;

    // Cambiar orientación del sprite dependiendo del movimiento
    if (this.body.velocity.x > 0) this.setFlipX(false);
    else if (this.body.velocity.x < 0) this.setFlipX(true);

    // movimiento con las flechas
    if (this.cursors.left.isDown) {
      this.lastDirection = true;
      this.setVelocityX(-speed); // Izquierda     
      if (this.body.onFloor()) this.play('char_walk', true); // Animación de andar
    } else if (this.cursors.right.isDown) {
      this.lastDirection = false;
      this.setVelocityX(speed); // Derecha
      if (this.body.onFloor()) this.play('char_walk', true); // Animación de andar
    } else {
      this.setVelocityX(0); // Detener movimiento horizontal
      if (this.body.onFloor()) this.play('char_idle', true); // Animación de Idle
    }

    // saltar solamente cuando esté en el suelo
    if (this.cursors.space.isDown && this.body.onFloor()) {
      this.doubleJumpAvailable = true;
      this.jumpFromFloorThisPress = true;

      this.setVelocityY(-jumpForce);
      //Animacion y sonido de salto
      this.play('char_jump', true);
      this.jumpSound.play();
    }

    if (!this.cursors.space.isDown) {
      this.jumpFromFloorThisPress = false;
    }

    if (!this.jumpFromFloorThisPress && this.cursors.space.isDown && this.doubleJumpAvailable) {
      this.doubleJumpAvailable = false;
      this.setVelocityY(-jumpForce);
      //Animacion y sonido de salto
      this.play('char_jump', true);
      this.jumpSound.play();
    }

    if (this.keys.dash.isDown && this.dashAvailable) {
      if (this.dashFramesCounter > 0) {
        this.dashFramesCounter--;
        if (this.dashFramesCounter <= 0) {
          this.dashAvailable = false;
        }
      }
      if (this.lastDirection) {
        this.setVelocityX(-speed * 4);
      } else {
        this.setVelocityX(speed * 4);
      }
    }

    if (!this.keys.dash.isDown) {
      if (this.dashFramesCounter < this.dashFramesTotal) {
        this.dashAvailable = false;
        this.dashFramesCounter++;
      } else if (this.body.onFloor()) {
        this.dashAvailable = true;
      }
    }

    //DISPARO
    if (this.keys.shoot.isDown && this.canShoot) {
        this.shoot();
    }
  }

  shoot(){

    //bloquear el disparo
    this.canShoot = false;

    //cooldown del disparo
    this.scene.time.delayedCall(500, () => {
        this.canShoot = true;
    });

    let bullet = this.bullets.create(this.x, this.y, 'bullet');

    if (this.flipX) {
        bullet.setVelocityX(-400);
    } else {
        bullet.setVelocityX(400);
    }

    bullet.setCollideWorldBounds(true);
    bullet.body.onWorldBounds = true;

  }

  takeDamage(enemyXPosition){

    //Ignora la funcion si ya esta recibiendo daño (invulnerabilidad por si acaso)
    if(this.inKnockback == true) return;

    this.health--; // Restamos uno de vida

    if (this.health <= 0) {
        this.scene.lose(); // Si se queda sin vidas, muere
        return;
    }

    // Activamos el estado de impacto
    this.inKnockback = true;

    // CALCULAR DIRECCIÓN DEL IMPULSO:
    // Si la X del jugador es menor que la del enemigo, el enemigo está a la derecha -> impulso a la izquierda (-1)
    // Si no, el enemigo está a la izquierda -> impulso a la derecha (1)
    const impulseDirection = this.x < enemyXPosition ? -1 : 1;

    // Aplicamos las velocidades del golpe
    this.setVelocityX(impulseDirection * 300); // Fuerza horizontal hacia atrás
    this.setVelocityY(-250);                  // Un pequeño saltito hacia arriba (queda muy arcade)

    // TEMPORIZADOR: A los 200 milisegundos, le devolvemos el control al jugador
    this.scene.time.delayedCall(200, () => {
        this.inKnockback = false;
        this.clearTint(); // Quitamos el color rojo
    });

    this.scene.tweens.add({
      targets: this,
      alpha: 0.2, // Baja la opacidad al 20% (casi invisible)
      duration: 60, // Súper rápido: 60 milisegundos por trayecto
      yoyo: true, // Va del 100% al 20% y vuelve al 100%
      repeat: 3, // Repite el ciclo 3 veces (4 parpadeos en total)
      onComplete: () => {
        this.setAlpha(1);
      },
    });
  }
}
