
let type = "WebGL"

if(!PIXI.utils.isWebGLSupported()){
    type = "canvas"
}

// var stage = new PIXI.Container();
// var renderer = PIXI.autoDetectRenderer(256, 256);
// document.body.appendChild(renderer.view);

// PIXI.loader.add("images/cat.png").load(setup);

// function setup() {
//   var cat = new PIXI.Sprite(PIXI.loader.resources["images/cat.png"].texture);

//   stage.addChild(cat);

//   renderer.render(stage);
// }

//Create a Pixi Application
let app = new PIXI.Application({ 
    width: 1200,         // default: 800
    height: 800,        // default: 600
    antialias: true,    // default: false
    transparent: false, // default: false
    resolution: 1       // default: 1
    }
);

// Texture files to be loaded as sprites
const mainCharacter = "images/skier.png";
const tree = "images/tree_a.png";
const snowman = "images/snowman.png";

//Add the canvas that Pixi automatically created for you to the HTML document
document.body.appendChild(app.view);

//load an image and run the `setup` function when it's done
PIXI.loader
  .add([mainCharacter])
  .add([tree])
  .add([snowman])
  .load(setup);

app.renderer.backgroundColor = 0xfcfcf9;

// Global variables
let player, state, gameScene, gameOverScene, message;
let treeTexture;
let treeSprites = [];
let snowmanTexture;
let snowmanSprites = [];

let totalElapsedTime = 0.0;
let treeSpeedDueToDownKey = 0;
let snowmanSpeedDueToDownKey = 0;

const mappings = {
    "left": 3,
    "right": 1,
    "default": 4
};

//This `setup` function will run when the image has loaded
function setup() {
    // Game Scene and Game Over Scene
    gameScene = new PIXI.Container();
    app.stage.addChild(gameScene);

    //Create the `tileset` sprite from the texture
    // let texture = PIXI.utils.TextureCache[mainCharacter];
    let texture = PIXI.BaseTexture.fromImage(mainCharacter);
    treeTexture = PIXI.utils.TextureCache[tree];
    snowmanTexture = PIXI.utils.TextureCache[snowman];

    //Create a rectangle object that defines the position and
    //size of the sub-image you want to extract from the texture
    //(`Rectangle` is an alias for `PIXI.Rectangle`)

    // Array of textures for player
    let textures = [];

    for (var i=0;i<3;i++) {
        for (var j=0;j<2;j++) {
            let rectangle = new PIXI.Rectangle(i*128,j*128,128,128);
            let smallTexture = new PIXI.Texture(texture, rectangle);
            textures.push(smallTexture); // Append texture to the array of textures
        }
    }

    player = new PIXI.Sprite(textures[mappings["default"]]);

    // Initial velocity (note: vertical velocity is obsolete)
    player.vx = 0;
    player.vy = 0;

    // Initial Position of the player
    player.position.set(app.renderer.width/2, app.renderer.height/10);
    gameScene.addChild(player);

    // Initialize the game over scene
    gameOverScene = new PIXI.Container();
    app.stage.addChild(gameOverScene);
    gameOverScene.visible = false;

    let style = new PIXI.TextStyle({
        fontFamily: "Futura",
        fontSize: 64,
        fill: "red"
    });

    message = new PIXI.Text("The End!", style);
    message.x = 500;
    message.y = app.stage.height;
    gameOverScene.addChild(message);

    const restart = new PIXI.Text("Restart");
    restart.position.set(600,app.stage.height+100);
    restart.buttonMode = true;
	restart.interactive = true;
	restart.on('click', (event) => {
		console.log("restart");
   		location.reload();

	});
	gameOverScene.addChild(restart);

      //Capture the keyboard arrow keys
    let left = keyboard(37),
         up = keyboard(38),
         right = keyboard(39),
         down = keyboard(40);

    //Left arrow key `press` method
    left.press = () => {
        //Change the cat's velocity when the key is pressed
        player.vx = -5;
        player.vy = 0;
        player.texture = textures[mappings["left"]];
    };
    
    //Left arrow key `release` method
    left.release = () => {
        //If the left arrow has been released, and the right arrow isn't down,
        //and the cat isn't moving vertically:
        //Stop the cat
        if (!right.isDown && player.vy === 0) {
            player.vx = 0;
            player.texture = textures[mappings["default"]];
        }
    };
    //Up
    up.press = () => {
        player.vy = -5;
        player.vx = 0;
    };
    up.release = () => {
        if (!down.isDown && player.vx === 0) {
            player.vy = 0;
        }
    };
    //Right
    right.press = () => {
        player.vx = 5;
        player.vy = 0;
        player.texture = textures[mappings["right"]];
    };
    right.release = () => {
        if (!left.isDown && player.vy === 0) {
            player.vx = 0;
            player.texture = textures[mappings["default"]];
            
        }
    };
    //Down
    down.press = () => {
        treeSpeedDueToDownKey = -1;
        snowmanSpeedDueToDownKey = -1;
        // player.vy = 5;
        // player.vx = 0;
    };
    down.release = () => {
        // if (!up.isDown && player.vx === 0) {
        // player.vy = 0;
        // }

        if (!up.isDown && player.vx === 0) {
            treeSpeedDueToDownKey = 0;
        }

        if (!up.isDown && player.vx === 0) {
            snowmanSpeedDueToDownKey = 0;
        }
    };

    // Set the game state to play
    state = play;

    app.ticker.add(delta => gameLoop(delta));
    app.ticker.start();
    
}
//The `keyboard` helper function
function keyboard(keyCode) {
  var key = {};
  key.code = keyCode;
  key.isDown = false;
  key.isUp = true;
  key.press = undefined;
  key.release = undefined;
  //The `downHandler`
  key.downHandler = event => {
    if (event.keyCode === key.code) {
      if (key.isUp && key.press) key.press();
      key.isDown = true;
      key.isUp = false;
    }
    event.preventDefault();
  };
  //The `upHandler`
  key.upHandler = event => {
    if (event.keyCode === key.code) {
      if (key.isDown && key.release) key.release();
      key.isDown = false;
      key.isUp = true;
    }
    event.preventDefault();
  };
  //Attach event listeners
  window.addEventListener(
    "keydown", key.downHandler.bind(key), false
  );
  window.addEventListener(
    "keyup", key.upHandler.bind(key), false
  );
  return key;
}


function gameLoop(delta) {
    //Runs the current game `state` in a loop and renders the sprites
    totalElapsedTime += delta;
    state(delta)
}
  
let treeSpeed = -5;
let treeSpeedIncrease = -1;
let treeSpawnRate = 100;

let snowmanSpeed = -2;
let snowmanSpeedIncrease = -1;
let snowmanSpawnRate = 100;

function play(delta) {
    // Update player position
    // player.y += player.vy;
    player.x += player.vx;

    // Move trees upward
    treeSprites.forEach((treeSprite) => {
        treeSprite.y += treeSpeed + treeSpeedDueToDownKey;
    })

    snowmanSprites.forEach((snowmanSprite) => {
        snowmanSprite.y += snowmanSpeed + snowmanSpeedDueToDownKey;
    })

    if (Math.round(totalElapsedTime) % treeSpawnRate == 0) {
        spawnTree();
    }

    if (Math.round(totalElapsedTime) % treeSpawnRate == 0) {
        spawnSnowman();
    }

    // Increase speed of trees as game progresses
    if (Math.round(totalElapsedTime) % 1000 == 0) {
        treeSpeed += treeSpeedIncrease;
        if (treeSpawnRate > 20) {
            treeSpawnRate -= 10;
        }
    }

    if (Math.round(totalElapsedTime) % 1000 == 0) {
        snowmanSpeed += snowmanSpeedIncrease;
        if (snowmanSpawnRate > 20) {
            snowmanSpawnRate -= 10;
        }
    }

    // Check for collision
    treeSprites.forEach((treeSprite) => {
        if (hitTestRectangle(player, treeSprite)) {
            //There's a collision
            // message.text = "hit!";
            treeSprite.tint = 0xff3300;
            state = end;
          } 
    })


    snowmanSprites.forEach((snowmanSprite) => {
        if (hitTestRectangle(player, snowmanSprite)) {
            //There's a collision
            // message.text = "hit!";
            snowmanSprite.tint = 0xff3300;
            state = end;
          } 
    })
}

function hitTestRectangle(r1, r2) {

  //Define the variables we'll need to calculate
  let hit, combinedHalfWidths, combinedHalfHeights, vx, vy;

  //hit will determine whether there's a collision
  hit = false;

  //Find the center points of each sprite
  r1.centerX = r1.x + r1.width / 2;
  r1.centerY = r1.y + r1.height / 2;
  r2.centerX = r2.x + r2.width / 2;
  r2.centerY = r2.y + r2.height / 2;

  //Find the half-widths and half-heights of each sprite
  r1.halfWidth = r1.width / 2;
  r1.halfHeight = r1.height / 2;
  r2.halfWidth = r2.width / 2;
  r2.halfHeight = r2.height / 2;

  //Calculate the distance vector between the sprites
  vx = r1.centerX - r2.centerX;
  vy = r1.centerY - r2.centerY;

  //Figure out the combined half-widths and half-heights
  combinedHalfWidths = r1.halfWidth + r2.halfWidth;
  combinedHalfHeights = r1.halfHeight + r2.halfHeight;

  //Check for a collision on the x axis
  if (Math.abs(vx) < combinedHalfWidths) {

    //A collision might be occurring. Check for a collision on the y axis
    if (Math.abs(vy) < combinedHalfHeights) {

      //There's definitely a collision happening
      hit = true;
    } else {

      //There's no collision on the y axis
      hit = false;
    }
  } else {

    //There's no collision on the x axis
    hit = false;
  }

  //`hit` will be either `true` or `false`
  return hit;
};


function spawnTree() {
    // set tree position
    let treeSprite = new PIXI.Sprite(treeTexture);
    treeSprite.position.set((Math.random() * (app.renderer.width - 1) + 1), (app.renderer.height - 200));
    gameScene.addChild(treeSprite);
    treeSprites.push(treeSprite);
}


function spawnSnowman() {
    // set tree position
    let snowmanSprite = new PIXI.Sprite(snowmanTexture);
    snowmanSprite.position.set((Math.random() * (app.renderer.width - 1) + 1), (app.renderer.height - 200));
    gameScene.addChild(snowmanSprite);
    snowmanSprites.push(snowmanSprite);
}


function end() {
    gameScene.visible = false;
    gameOverScene.visible = true;
    // console.log("Game Over");
    //All the code that should run at the end of the game
}