// Importar la clase del jugador desde el archivo externo
import Jugador from './jugador.js';
import Enemy from './enemy.js';
import EnemyPatrol from './enemyPatrol.js';
import FlyingEnemy from './flyingEnemy.js';

export default class EscenaBase extends Phaser.Scene {
  constructor() {
    super({ key: "EscenaBase" });
  }

  preload() {
    // cargar todos los recursos
    this.load.image("tilesheet", "assets/tilemap_64.png"); // tilemap
    this.load.tilemapTiledJSON("map", "assets/tilemap_64.json"); // Mapa en formato JSON
    this.load.image("player", "assets/char_idle1.png"); // Imagen del jugador
    this.load.image("key", "assets/key.png"); // imagen de la llave
    this.load.image("spike", "assets/spikes.png"); // imagen de los pinchos
    this.load.audio("jump", "assets/jump.mp3"); // sonido de salto
    this.load.audio("pickup", "assets/pickup.mp3"); // sonido de recoger la llave
    this.load.audio("victory", "assets/victory.mp3"); // sonido de victoria
    this.load.audio("defeat", "assets/defeat.mp3"); // sonido de derrota
    this.load.image("bullet", "assets/bullet.png"); //Sprite de la bala
    this.load.image("enemy", "assets/enemy.png"); //Sprite del enemigo
    this.load.image("enemy_patrol", "assets/enemy.png"); //Sprite del enemigo que se mueve horizontalmente
    this.load.image("enemy_flying", "assets/enemy.png"); //Sprite del enemigo volador

    // Cargar atlas para el jugador (nueva línea añadida)
    this.load.atlas(
      "spr_character",
      "assets/spr_character.png",
      "assets/spr_character_atlas.json",
    );
  }

  create() {

    this.createTilemap();
    this.createSounds();
    this.createPlayer();
    this.createSceneObjects();  

    //TEMPORIZADOR

    // inicializar el tiempo cada vez que se reinicia la escena
    this.totalTime = 60;

    // añadir el tiempo al registro global para acceder desde el HUD
    this.registry.set("totalTime", this.totalTime);

    // crear un temporizador que actualiza el tiempo cada segundo
    this.timer = this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.totalTime--;

        // actualizar el valor del tiempo en el registro para que el HUD actualice el texto
        this.registry.set("totalTime", this.totalTime);

        if (this.totalTime <= 0) this.lose();
      },
      callbackScope: this,
      loop: true,
    });

    //FIN DE PARTIDA

    this.txtEndGame = this.add
      .text(800, 400, "", {
        fontSize: "64px",
        fill: "#fff",
        fontFamily: "Calibri",
        fontWeight: "bold",
      })
      .setOrigin(0.5);

    // Boton que aparecera cuando se gane / pierda
    this.restartBtn = this.add
      .text(800, 500, "REINICIAR", {
        fontSize: "30px",
        fill: "#fff",
        backgroundColor: "#000",
        fontFamily: "Calibri",
        padding: { x: 20, y: 10 },
      })
      .setInteractive()
      .setVisible(false)
      .setOrigin(0.5);

    // añadir al boton que se reinicie el juego cuando se le haga clic
    this.restartBtn.on("pointerdown", () => {
      //quitar los eventos registrados desde el HUD para cuando se reinicie la escena
      this.registry.events.off("changedata-score");
      this.registry.events.off("changedata-totalTime");
      this.scene.restart();
    });

    //DISPARO

    // Cuando cualquier objeto con onWorldBounds llegue al borde del mundo, se destruye
    this.physics.world.on("worldbounds", (body) => {
      body.gameObject.destroy();
    });

    // configurar colisiones de la bala
    this.physics.add.collider(
      this.player.bullets,
      this.platforms,
      (bullet, tile) => {
        bullet.destroy();
      },
      null,
      this,
    );

    //#region ENEMIGOS

    //ENEMIGOS ESTATICOS

    this.staticEnemies = this.physics.add.staticGroup({
      runChildUpdate: true, // esto hace que se ejecute el update() de cada enemigo de forma independiente
    });

    const enemyLayer = this.map.objects.find(
      (layer) => layer.name === "enemies_static",
    );

    if (enemyLayer && enemyLayer.objects) {
      enemyLayer.objects.forEach((obj) => {
        const enemy = new Enemy(this, obj.x, obj.y);
        this.staticEnemies.add(enemy);
        enemy.refreshBody();
      });
    }

    // configurar colisiones
    this.physics.add.overlap(
      this.player,
      this.staticEnemies,
      this.playerEnemyCollision,
      null,
      this,
    );

    this.physics.add.overlap(
      this.player.bullets,
      this.staticEnemies,
      this.enemyTakeDamage,
      null,
      this,
    );

    //ENEMIGOS QUE PATRULLAN HORIZONTALMENTE

    this.patrolEnemies = this.physics.add.group({ runChildUpdate: true });

    const patrolLayer = this.map.objects.find(
      (layer) => layer.name === "enemies_patrol",
    );
    if (patrolLayer && patrolLayer.objects) {
      patrolLayer.objects.forEach((obj) => {
        const goomba = new EnemyPatrol(this, obj.x, obj.y);
        this.patrolEnemies.add(goomba);
      });
    }

    // estos enemigos necesitan chocar contra el suelo para no caer al vacío
    this.physics.add.collider(this.patrolEnemies, this.platforms);

    //configurar colisiones
    this.physics.add.overlap(
      this.player,
      this.patrolEnemies,
      this.playerEnemyCollision,
      null,
      this,
    );

    this.physics.add.overlap(
      this.player.bullets,
      this.patrolEnemies,
      this.enemyTakeDamage,
      null,
      this,
    );

    //ENEMIGOS CON MOVIMIENTO VERTICAL (VOLADORES)

    this.flyingEnemies = this.physics.add.group({
      runChildUpdate: true,
      allowGravity: false, // que no tengan gravedad por defecto
      immovable: true, // que sean inmoviles
    });

    // const flyingLayer = this.map.objects.find(layer => layer.name === 'flying_enemies');
    // if (flyingLayer && flyingLayer.objects) {
    //     flyingLayer.objects.forEach(obj => {
    //         const obstacle = new FlyingEnemy(this, obj.x, obj.y);
    //         this.flyingEnemies.add(obstacle);
    //     });
    // }

    const flyingEnemy = new FlyingEnemy(this, 200, 300);

    this.flyingEnemies.add(flyingEnemy);

    // configurar colisiones
    this.physics.add.overlap(
      this.player,
      this.flyingEnemies,
      this.playerEnemyCollision,
      null,
      this,
    );
    this.physics.add.overlap(
      this.player.bullets,
      this.flyingEnemies,
      this.enemyTakeDamage,
      null,
      this,
    );
    //#endregion

    //HUD

    // añadir puntuacion al registro
    this.registry.set("score", 0);

    // crear la escena aparte del HUD
    this.scene.launch("HUDScene");
  }

  update() {
    //actualizar temporizador
    if (this.totalTime > 0) {
      this.player.update();
    }
  }

  // FUNCIONES

  //#region Funciones en CREATE

  createTilemap() {

    this.map = this.make.tilemap({ key: "map" });
    const tiles = this.map.addTilesetImage("tilemap_64", "tilesheet", 64, 64, 0, 0);
    this.platforms = this.map.createLayer("platformer", tiles, 0, 0);
    this.decoration = this.map.createLayer("decoration", tiles, 0, 0);

    this.platforms.setCollisionByExclusion(-1, true);

    //PUERTAS

    // añadir la puerta abierta y la cerrada
    this.door = this.map.createLayer("door", tiles, 0, 0);
    this.openDoor = this.map.createLayer("door_open", tiles, 0, 0);
    // ocultar la puerta abierta hasta que se recoja la llave
    this.openDoor.setVisible(false);
  }

  createSounds(){

    this.jumpSound = this.sound.add("jump");
    this.pickupSound = this.sound.add("pickup");
    this.victorySound = this.sound.add("victory");
    this.defeatSound = this.sound.add("defeat");
  }

  createPlayer(){

    // Crear el jugador con referencia al sonido de salto
    this.player = new Jugador(this, 0, 425, this.jumpSound);
    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, this.platforms);

    // hacer que la camara principal siga al jugador
    this.cameras.main.startFollow(this.player);
    // añadir limites a la camara para que no se vea el fondo al llegar a los bordes
    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
  }

  createSceneObjects(){
    //COLISION PUERTAS: hay que hacerlo despues de inicializar al jugador para que este la referencia asignada
    //tambien hay que crear antes los sprites de las puertas para que se vean por detras del jugador

    //configurar el overlap de la puerta abierta
    const doorTiles = this.openDoor
      .getTilesWithin()
      .filter((t) => t.index !== -1)
      .map((t) => t.index);
    this.openDoor.setTileIndexCallback(doorTiles, this.goThroughDoor, this);
    this.physics.add.overlap(this.player, this.openDoor);

    //LLAVE

    //inicializar que el jugador no ha recogido la llave todavia
    this.hasKey = false;
    //crear la llave en su posición y marcarla como inmóvil y que no utilice gravedad
    this.key = this.physics.add.sprite(1500, 192, "key");
    this.key.setImmovable(true);
    this.key.body.setAllowGravity(false);
    //configurar el overlap para que la llave detecte al jugador
    this.physics.add.overlap(this.player, this.key, this.pickupKey, null, this);

    //PINCHOS

    //crear pinchos en cada posicion de objeto creado en el tilemap
    //esta forma de buscar la layer es más compleja, pero al hacerlo con getObjectLayer daba error al acceder a ojects
    //de esta manera si que funciona sin problema
    const spikeLayer = this.map.objects.find((layer) => layer.name === "spikes");
    if (spikeLayer && spikeLayer.objects) {
      this.spikes = this.physics.add.staticGroup();

      spikeLayer.objects.forEach((obj) => {
        const spike = this.spikes.create(obj.x, obj.y, "spike");
        //para que aparezcan en la misma posicion definida en la capa de Tiled
        spike.setOrigin(0, 0);
        //si no se añade, no se actualiza la colision y se queda desplazada
        spike.refreshBody();
      });

      //añadir el overlap a los pinchos para que termine la partida
      this.physics.add.overlap(this.player, this.spikes, this.lose, null, this);
    }
  }

  //#endregion

  // parar el juego cuando se gana / pierde
  endGame() {
    this.physics.pause(); // Detener físicas
    this.restartBtn.setVisible(true); // Mostrar botón para reiniciar
    this.timer.remove(); // Detener el temporizador para que no siga restando tiempo
  }

  //para cuando se recoge la llave y desbloquea la puerta
  pickupKey() {
    //ocultar la llave
    this.key.disableBody(true, true);
    //marcar como llave recogida
    this.hasKey = true;
    // mostrar la puerta abierta y ocultar la cerrada
    this.openDoor.setVisible(true);
    this.door.setVisible(false);
    this.pickupSound.play();
  }

  //para cuando se pierde (pinchos, tiempo)
  lose() {
    this.txtEndGame.setText("HAS PERDIDO");
    this.txtEndGame.setColor("#ff0000");
    this.endGame();
    this.defeatSound.play();
  }

  //para cuando se gana al pasar por la puerta abierta
  goThroughDoor() {
    if (this.hasKey == false) return;

    this.txtEndGame.setText("¡HAS GANADO!");
    this.txtEndGame.setColor("#1eff00");
    this.endGame();
    this.victorySound.play();
  }

  //ENEMIGOS

  // evento cuando una bala golpee contra un enemigo
  enemyTakeDamage(bullet, enemy) {
    bullet.destroy();
    enemy.takeDamage(1);
    if (enemy.health <= 0) {
      this.addScore(100); //añadir puntos al matar a un enemigo
    }
  }

  // evento cuando el jugador choca contra un enemigo
  playerEnemyCollision(player, enemy) {
    player.takeDamage(enemy.x);
  }

  //añadir puntuacion

  addScore(points) {
    const currentScore = this.registry.get("score");
    this.registry.set("score", currentScore + points);
  }
}