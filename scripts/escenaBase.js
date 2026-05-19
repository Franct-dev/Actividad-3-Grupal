// Importar la clase del jugador desde el archivo externo
import Jugador from './jugador.js';
import Enemy from './enemy.js';
import EnemyPatrol from './enemyPatrol.js';

export default class EscenaBase extends Phaser.Scene {
  constructor() {
    super({ key: 'EscenaBase' });
  }

  preload() {
    // cargar todos los recursos
    this.load.image('tilesheet', 'assets/tilemap_64.png'); // tilemap
    this.load.tilemapTiledJSON('map', 'assets/tilemap_64.json'); // Mapa en formato JSON
    this.load.image('player', 'assets/char_idle1.png'); // Imagen del jugador
    this.load.image('key', 'assets/key.png'); // imagen de la llave
    this.load.image('spike', 'assets/spikes.png'); // imagen de los pinchos
    this.load.audio('jump', 'assets/jump.mp3'); // sonido de salto
    this.load.audio('pickup', 'assets/pickup.mp3'); // sonido de recoger la llave
    this.load.audio('victory', 'assets/victory.mp3'); // sonido de victoria
    this.load.audio('defeat', 'assets/defeat.mp3'); // sonido de derrota
    this.load.image('bullet', 'assets/bullet.png'); //Sprite de la bala
    this.load.image('enemy', 'assets/enemy.png'); //Sprite del enemigo
    this.load.image('enemy_patrol', 'assets/enemy.png'); //Sprite del enemigo que se mueve horizontalmente


    // Cargar atlas para el jugador (nueva línea añadida)
    this.load.atlas('spr_character', 'assets/spr_character.png', 'assets/spr_character_atlas.json');
  }

  create() {

    //TILEMAP

    const map = this.make.tilemap({ key: 'map' });
    const tiles = map.addTilesetImage('tilemap_64', 'tilesheet', 64, 64, 0, 0);
    const platforms = map.createLayer('platformer', tiles, 0, 0);
    const decoration = map.createLayer('decoration', tiles, 0,0);

    platforms.setCollisionByExclusion(-1, true);

    //PUERTAS

    // añadir la puerta abierta y la cerrada
    this.door = map.createLayer('door', tiles, 0,0);
    this.openDoor = map.createLayer('door_open', tiles, 0,0);
    // ocultar la puerta abierta hasta que se recoja la llave
    this.openDoor.setVisible(false);

    //SONIDO

    // Cargar sonidos
    this.jumpSound = this.sound.add('jump');
    this.pickupSound = this.sound.add('pickup');
    this.victorySound = this.sound.add('victory');
    this.defeatSound = this.sound.add('defeat');

    //JUGADOR

    // Crear el jugador con referencia al sonido de salto
    this.player = new Jugador(this, 0, 425, this.jumpSound);
    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, platforms);

    //COLISION PUERTAS: hay que hacerlo despues de inicializar al jugador para que este la referencia asignada
    //tambien hay que crear antes los sprites de las puertas para que se vean por detras del jugador

    //configurar el overlap de la puerta abierta
     const doorTiles = this.openDoor.getTilesWithin().filter(t => t.index !== -1).map(t => t.index);
    this.openDoor.setTileIndexCallback(doorTiles, this.goThroughDoor, this);
    this.physics.add.overlap(this.player, this.openDoor);

    //LLAVE

    //inicializar que el jugador no ha recogido la llave todavia
    this.hasKey = false;
    //crear la llave en su posición y marcarla como inmóvil y que no utilice gravedad
    this.key = this.physics.add.sprite(1500, 192, 'key');
    this.key.setImmovable(true);
    this.key.body.setAllowGravity(false);
    //configurar el overlap para que la llave detecte al jugador
    this.physics.add.overlap(this.player, this.key, this.pickupKey, null, this);

    //PINCHOS

    //crear pinchos en cada posicion de objeto creado en el tilemap
    //esta forma de buscar la layer es más compleja, pero al hacerlo con getObjectLayer daba error al acceder a ojects
    //de esta manera si que funciona sin problema
    const spikeLayer = map.objects.find(layer => layer.name === 'spikes');
    if (spikeLayer && spikeLayer.objects) {

      this.spikes = this.physics.add.staticGroup();

      spikeLayer.objects.forEach(obj => {
        const spike = this.spikes.create(obj.x, obj.y, 'spike');
        //para que aparezcan en la misma posicion definida en la capa de Tiled
        spike.setOrigin(0, 0);
        //si no se añade, no se actualiza la colision y se queda desplazada
        spike.refreshBody();
      });

      //añadir el overlap a los pinchos para que termine la partida
      this.physics.add.overlap(this.player, this.spikes, this.lose, null, this);
    } 

    //TEMPORIZADOR

    // inicializar el tiempo cada vez que se reinicia la escena
    this.totalTime = 60;

    // mostrar texto con el tiempo restante
    this.txtTime = this.add.text(20, 25, 'Tiempo: 60', { fontSize: '32px', fill: '#fff' , fontFamily:'Calibri'});

    // crear un temporizador que actualiza el tiempo cada segundo
    this.timer = this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.totalTime--;
        this.txtTime.setText('Tiempo: ' + this.totalTime);
        if (this.totalTime <= 0) this.lose();
      },
      callbackScope: this,
      loop: true
    });

    //FIN DE PARTIDA

    this.txtEndGame = this.add.text(800, 400, '', 
      { fontSize: '64px',
        fill: '#fff',
        fontFamily:'Calibri',
        fontWeight:'bold'}).setOrigin(0.5);
        

    // Boton que aparecera cuando se gane / pierda
    this.restartBtn = this.add.text(800, 500, 'REINICIAR', {
      fontSize: '30px',
      fill: '#fff',
      backgroundColor: '#000',
      fontFamily:'Calibri',
      padding: { x: 20, y: 10 }
    }).setInteractive().setVisible(false).setOrigin(0.5);

    // añadir al boton que se reinicie el juego cuando se le haga clic
    this.restartBtn.on('pointerdown', () => this.scene.restart());

    //DISPARO

    // Cuando cualquier objeto con onWorldBounds llegue al borde del mundo, se destruye
    this.physics.world.on('worldbounds', (body) => {
      body.gameObject.destroy();
    });

    // Hacer que la bala choque contra el tilemap con colision
    this.physics.add.collider(this.player.bullets, platforms, (bullet, tile) => {
      bullet.destroy();
    }, null, this);

    //ENEMIGOS ESTATICOS

    this.staticEnemies = this.physics.add.staticGroup({
        runChildUpdate: true // esto hace que se ejecute el update() de cada enemigo de forma independiente
    });

    // Buscar la capa de objetos 'enemies_static' creada en Tiled
    const enemyLayer = map.objects.find(layer => layer.name === 'enemies_static');

    if (enemyLayer && enemyLayer.objects) {

        enemyLayer.objects.forEach(obj => {
          // Creamos el enemigo usando la posición de Tiled
          const enemy = new Enemy(this, obj.x, obj.y);
          this.staticEnemies.add(enemy);
          enemy.refreshBody();
        });
    }

    // Colisión entre el jugador y los enemigos (opcional: el jugador recibe daño)
    this.physics.add.overlap(this.player, this.staticEnemies, this.playerEnemyCollision, null, this);
    // Colisión: Bala contra Enemigo
    this.physics.add.overlap(this.player.bullets, this.staticEnemies, this.enemyTakeDamage, null, this);

    //ENEMIGOS QUE PATRULLAN HORIZONTALMENTE

    // 1. Crear el grupo DINÁMICO para los enemigos que se mueven
    this.patrolEnemies = this.physics.add.group({ runChildUpdate: true });

    // 2. Leerlos desde Tiled e instanciarlos
    const patrolLayer = map.objects.find(layer => layer.name === 'enemies_patrol');
    if (patrolLayer && patrolLayer.objects) {
      patrolLayer.objects.forEach(obj => {
        const goomba = new EnemyPatrol(this, obj.x, obj.y);
        this.patrolEnemies.add(goomba);
      });
    }

    // 3. LAS COLISIONES (¡Súper importante!)
    // A diferencia de los estáticos, estos necesitan chocar contra el suelo para no caer al vacío
    this.physics.add.collider(this.patrolEnemies, platforms);

    // Reutilizamos las mismas funciones de daño y colisión que ya tenías programadas
    this.physics.add.overlap(this.player, this.patrolEnemies, this.playerEnemyCollision, null, this);
    this.physics.add.overlap(this.player.bullets, this.patrolEnemies, this.enemyTakeDamage, null, this);

  }

  update() {
    //actualizar temporizador
    if (this.totalTime > 0) {
      this.player.update();
    }
  }

  // FUNCIONES

  // parar el juego cuando se gana / pierde
  endGame() {
    this.physics.pause(); // Detener físicas
    this.restartBtn.setVisible(true); // Mostrar botón para reiniciar
    this.timer.remove(); // Detener el temporizador para que no siga restando tiempo
  }

  //para cuando se recoge la llave y desbloquea la puerta
  pickupKey(){
    
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
  lose(){

    this.txtEndGame.setText('HAS PERDIDO');
    this.txtEndGame.setColor('#ff0000');
    this.endGame();
    this.defeatSound.play();
  }

  //para cuando se gana al pasar por la puerta abierta
  goThroughDoor(){

    if(this.hasKey == false) return;

    this.txtEndGame.setText('¡HAS GANADO!');
    this.txtEndGame.setColor('#1eff00');
    this.endGame();
    this.victorySound.play();
  }

  //ENEMIGOS

  // Acción cuando la bala golpea al enemigo
enemyTakeDamage(bullet, enemy) {
    bullet.destroy(); 
    enemy.takeDamage(1);

}

// Acción si el jugador choca directamente con el enemigo sin dispararle
playerEnemyCollision(player, enemy) {

    player.takeDamage(enemy.x);
}
}