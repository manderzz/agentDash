
let type = "WebGL"

if(!PIXI.utils.isWebGLSupported()){
    type = "canvas"
}

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
// const mainCharacter = "images/skier.png";
const playerLeft = "images/skier_left.png";
const playerRight = "images/skier_right.png";
const playerDefault = "images/skier_default.png";

const tree = "images/tree_a.png";
const snowman = "images/snowman.png";
const cloud = "images/clouds_opaque.png";
const flags = "images/flags.png";

const bigCloud = "images/bigcloud.png";
const smallCloud = "images/smallcloud.png";

//Add the canvas that Pixi automatically created for you to the HTML document
document.body.appendChild(app.view);

//load an image and run the `setup` function when it's done
PIXI.loader
//   .add([mainCharacter])
  .add([playerLeft, playerRight, playerDefault, tree, snowman, bigCloud, smallCloud, flags])
  .load(setup);

app.renderer.backgroundColor = 0xfcfcf9;

// Global variables
let player, state, gameScene, gameOverScene, message, scoreDisplay, startMessage, cloudContainer;
let treeTexture;
let treeSprites = [];
let snowmanTexture;
let snowmanSprites = [];
let cloudTextures = [];
let cloudSprites = [];
let redFlagTextures = [];
let redFlagSprite;
let redFlagSprites = [];
let blueFlagTextures = [];
let blueFlagSprite;
let blueFlagSprites = [];

// speed of snowman and tree are the same
let treeSpawnRate = 100;

let snowmanSpawnRate = 120;


// let flagSpawnRate = 150;

let redFlagSpawnRate = 100;
let blueFlagSpawnRate = 120;


let cloudHorizontalSpeed = 5;
let cloudVerticalSpeed = 0;
let cloudSpawnRate = 120;

let baseSpeed = -5;
let speedIncrease = -1;
let downAcceleration = 0;

let totalElapsedTime = 0.0;
// let treeSpeedDueToDownKey = 0;
// let snowmanSpeedDueToDownKey = 0;
// let flagSpeedDuetoDownKey = 0;

let pause = false;

var score = 0;

const mappings = {
    "left": 1,
    "right": 2,
    "default": 0
};

const flagMappings = {
    "center":0,
    "left":1,
    "right":2
};

//This `setup` function will run when the image has loaded
function setup() {
    // Game Scene and Game Over Scene
    gameScene = new PIXI.Container();
    app.stage.addChild(gameScene);

    cloudContainer = new PIXI.Container();
    cloudContainer.zIndex = 1000000;
    app.stage.addChild(cloudContainer);

    //Create the `tileset` sprite from the texture
    // let texture = PIXI.utils.TextureCache[mainCharacter];
    // let texture = PIXI.BaseTexture.fromImage(mainCharacter);
    treeTexture = PIXI.utils.TextureCache[tree];
    snowmanTexture = PIXI.utils.TextureCache[snowman];

    // ====================================================
    let flagTexture = PIXI.BaseTexture.fromImage(flags);

    // =============================================
    // Creating cloud sprites
    let bigCloudTexture = PIXI.utils.TextureCache[bigCloud];
    let smallCloudTexture = PIXI.utils.TextureCache[smallCloud];
    cloudTextures.push(bigCloudTexture);
    cloudTextures.push(smallCloudTexture);

    // let cloudRectangle = new PIXI.Rectangle(0,0,550,275);
    // let subCloudTexture = new PIXI.Texture(cloudTexture, cloudRectangle);
    // cloudTextures.push(subCloudTexture);

    // cloudRectangle = new PIXI.Rectangle(210,275,340,275);
    // subCloudTexture = new PIXI.Texture(cloudTexture, cloudRectangle);
    // cloudTextures.push(subCloudTexture);
    // =============================================

    // Array of textures for player
    let textures = [];
    let defaultTexture = PIXI.utils.TextureCache[playerDefault];
    let leftTexture = PIXI.utils.TextureCache[playerLeft];
    let rightTexture = PIXI.utils.TextureCache[playerRight];

    textures.push(defaultTexture)
    textures.push(leftTexture)
    textures.push(rightTexture);



    // const offset = 5;

    // for (var i=0; i<3; i++) {
    //     for (var j=0; j<2; j++) {
    //         let rectangle = new PIXI.Rectangle(i*128+offset,j*128+offset,128-2*offset,128-2*offset);
    //         let smallTexture = new PIXI.Texture(texture, rectangle);
    //         textures.push(smallTexture); // Append texture to the array of textures
    //     }
    // }
    // Array of textures for flags
    // 196x210

    // for (var i =0; i<3; i++){
    //   for (var j = 0; j<2; j++){
    //     let rectangle = new PIXI.Rectangle(i*65.3,j*105, 65.3, 105);
    //     let smallTexture = new PIXI.Texture(flagTexture, rectangle);
    //     flagTextures.push(smallTexture);
    //   }
    // }

    for (var i =0; i<3; i++){
        let rectangle = new PIXI.Rectangle(i*65.3,0, 65.3, 105);
        let smallTexture = new PIXI.Texture(flagTexture, rectangle);
        blueFlagTextures.push(smallTexture);
    }

     for (var i =0; i<3; i++){
        let rectangle = new PIXI.Rectangle(i*65.3,105, 65.3, 105);
        let smallTexture = new PIXI.Texture(flagTexture, rectangle);
        redFlagTextures.push(smallTexture);
    }

    // ================================
    // Initialize the start game scene
    startGameScene = new PIXI.Container();
    app.stage.addChild(startGameScene);
    startGameScene.visible = true;

    let gameStart_style = new PIXI.TextStyle({
        fontFamily: "Futura",
        fontSize: 64,
        fill: "black",
        stroke: '#ff3300',
        strokeThickness: 4,
        dropShadow: true,
        dropShadowColor: "#000000",
        dropShadowBlur: 4,
        dropShadowAngle: Math.PI / 6,
        dropShadowDistance: 6
    });
    
    startMessage = new PIXI.Text("Agent Dash", gameStart_style);
    startMessage.anchor.set(0.5);
    startMessage.x = 600;
    startMessage.y = app.stage.height + 50;
    startGameScene.addChild(startMessage);

    const start = new PIXI.Text("Start Game");
    start.anchor.set(0.5);
    start.position.set(600,app.stage.height+200);
    start.buttonMode = true;
    start.interactive = true;
    start.on('click', (event) => {
        console.log("start game");
        startGameScene.visible = false;
        scoreDisplay.visible = true;
        state = play;
        app.ticker.add(delta => gameLoop(delta));
        app.ticker.start();
    });
    startGameScene.addChild(start);
    
    
    

    player = new PIXI.Sprite(textures[mappings["default"]]);

    // Initial velocity (note: vertical velocity is obsolete)
    player.vx = 0;
    player.vy = 0;

    // Initial Position of the player
    player.anchor.set(0.5)
    player.position.set(app.renderer.width/2, app.renderer.height - 650);
    gameScene.addChild(player);

    // Placing flag on image
    //flag = new PIXI.Sprite(flagTextures[flagMappings["red"]]);

    //flag.position.set(500,500);
    //gameScene.addChild(flag);

    // =========================================================
    // score display stuff
    let scoreDisplay_style = new PIXI.TextStyle({
    	fontFamily: "Futura",
    	fontSize: 18,
    	fill: "black"
    })

    scoreDisplay = new PIXI.Text("Score: " + Math.round(score), scoreDisplay_style);
    scoreDisplay.visible = false;

    app.stage.addChild(scoreDisplay);
    // if (state === end) {
    // 	scoreDisplay.position.set(600,app.stage.height+200);
    // }

    // Initialize the Game Over scene
    gameOverScene = new PIXI.Container();
    app.stage.addChild(gameOverScene);
    gameOverScene.visible = false;

    let gameOver_style = new PIXI.TextStyle({
        fontFamily: "Futura",
        fontSize: 64,
        fill: "red"
    });

    // "The End"
    message = new PIXI.Text("The End!", gameOver_style);
    message.anchor.set(0.5);
    message.x = 600;
    message.y = app.stage.height;
    gameOverScene.addChild(message);

    const restart = new PIXI.Text("Restart");
    restart.anchor.set(0.5);
    restart.position.set(600,app.stage.height+200);
    restart.buttonMode = true;
	restart.interactive = true;
	restart.on('click', (event) => {
		console.log("restart");
   		location.reload();

	});
	gameOverScene.addChild(restart);

      //Capture the keyboard arrow keys
    let left = keyboard(37);
         up = keyboard(38);
         right = keyboard(39);
         down = keyboard(40);
         space = keyboard(32);
         enter = keyboard(13);

    //Left arrow key `press` method
    left.press = () => {
        //Change the cat's velocity when the key is pressed
        if(pause == false) {
        player.vx = -5;
        player.vy = 0;
        player.texture = textures[mappings["left"]];
      }
    };
    
    //Left arrow key `release` method
    left.release = () => {
        //If the left arrow has been released, and the right arrow isn't down,
        if (!right.isDown && player.vy === 0) {
            player.vx = 0;
            player.texture = textures[mappings["default"]];
        }
    };

    //Up
    // up.press = () => {
    //     player.vy = -5;
    //     player.vx = 0;
    // };
    // up.release = () => {
    //     if (!down.isDown && player.vx === 0) {
    //         player.vy = 0;
    //     }
    // };

    //Right
    right.press = () => {
      if(pause == false) {
        player.vx = 5;
        player.vy = 0;
        player.texture = textures[mappings["right"]];
      }
        
    };
    right.release = () => {
        if (!left.isDown && player.vy === 0) {
            player.vx = 0;
            player.texture = textures[mappings["default"]];
        }
    };
    //Down
    down.press = () => {
      if(pause == false) {
        downAcceleration = -5;
      }
    };
    down.release = () => {
        if (!up.isDown) {
            downAcceleration = 0;
        }
    };
    //Pause
    space.press = () => {
      baseSpeed = 0;
      speedIncrease = 0;

    //   treeSpeed = 0;
    //   treeSpeedIncrease = 0;
      treeSpawnRate = 0;
      downAcceleration = 0;
    //   snowmanSpeed = 0;
    //   snowmanSpeedIncrease = 0;
      snowmanSpawnRate = 0;

    //   flagSpeed = 0;
    //   flagSpeedIncrease = 0;
      flagSpawnRate = 0;

    //   redFlagSpeed = 0;
      redFlagSpeedIncrease = 0;
      redFlagSpawnRate = 0;
    //   blueFlagSpeed = 0;
      blueFlagSpeedIncrease = 0;
      blueFlagSpawnRate = 0;

      cloudHorizontalSpeed = 0;
      cloudVerticalSpeed = 0;
      cloudVerticalSpeedIncrease = 0;
      cloudSpawnRate = 0;
      player.vx = 0;
      player.vy = 0;
      pause = true;
    }

    enter.press = () => {
      baseSpeed = -5;
      speedIncrease = -1;
    //   treeSpeedIncrease = -1;
      treeSpawnRate = 100;

    //   snowmanSpeedIncrease = -1;
      snowmanSpawnRate = 120;

    //   redFlagSpeedIncrease = -1;
      redFlagSpawnRate = 90;

    //   blueFlagSpeedIncrease = -1;
      blueFlagSpawnRate = 70;

      cloudHorizontalSpeed = 5;
      cloudVerticalSpeed = 0;
      cloudVerticalSpeedIncrease = -1;
      cloudSpawnRate = 120;

      pause = false;
    }

    pause.press = () => {
        
        player.vx = 0;
        downAcceleration = 0;

        baseSpeed = 0;
        speedIncrease = 0;
        // treeSpeed = 0;
        // treeSpeedIncrease = 0;
        treeSpawnRate = 0;

        // snowmanSpeed = 0;
        // snowmanSpeedIncrease = 0;
        snowmanSpawnRate = 0;

        cloudHorizontalSpeed = 0;
        cloudVerticalSpeed = 0;
        cloudVerticalSpeedIncrease = 0;
        cloudSpawnRate = 0;

        // redFlagSpeed = 0;
        // redFlagSpeedIncrease = 0;
        redFlagSpawnRate = 0;

        // blueFlagSpeed = 0;
        // blueFlagSpeedIncrease = 0;
        blueFlagSpawnRate = 0;

        player.texture = textures[mappings["default"]];
        
    };


    enter.press = () => {

        player.vx = 0;
        player.vy = 0;

        baseSpeed = -5;
        speedIncrease = -1;

        // treeSpeed = -5;
        // treeSpeedIncrease = -5;
        treeSpawnRate = 100;

        // snowmanSpeed = -5;
        // snowmanSpeedIncrease = -5;
        snowmanSpawnRate = 120;

        cloudHorizontalSpeed = 5;
        cloudVerticalSpeed = 0;
        cloudVerticalSpeedIncrease = -1;
        cloudSpawnRate = 120;

        // redFlagSpeed = -5;
        // redFlagSpeedIncrease = -5;
        redFlagSpawnRate = 90;

        // blueFlagSpeed = -5;
        // blueFlagSpeedIncrease = -5;
        blueFlagSpawnRate = 70;

        pause = false;
    };

    // Set the game state to play
   // state = play;

    // app.ticker.add(delta => gameLoop(delta));
    // app.ticker.start();
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
    // totalElapsedTime += app.ticker.elapsedMS/1000;
    scoreDisplay.text = "Score: " + Math.round(score);
    state(delta)
}

function play(delta) {
    // Update player position

    if (player.x <= 0 + player.width) {
    	if (player.vx < 0) {
    		player.x += 0
    	} else {
    		player.x += player.vx
    	}
    }
    else if (player.x >= 1200 - player.width) {
    	if (player.vx > 0) {
    		player.x += 0
    	} else {
    		player.x += player.vx
    	}
    }
    else {
    	player.x += player.vx
    }

    // Move trees upward
    treeSprites.forEach((treeSprite) => {
        treeSprite.y += baseSpeed + downAcceleration;
    })

    snowmanSprites.forEach((snowmanSprite) => {
        snowmanSprite.y += baseSpeed + downAcceleration;
    })

    // flagSprites.forEach((flagSprite) => {
    //   flagSprite.y += flagSpeed + downAcceleration;
    redFlagSprites.forEach((redFlagSprite) => {
      redFlagSprite.y += baseSpeed + downAcceleration;
    })
    blueFlagSprites.forEach((blueFlagSprite) => {
      blueFlagSprite.y += baseSpeed + downAcceleration;
    })

    cloudSprites.forEach((cloudSprite) => {
        cloudSprite.x += cloudHorizontalSpeed;
        cloudSprite.y += cloudVerticalSpeed + downAcceleration;
    })

    if (Math.round(totalElapsedTime) % treeSpawnRate == 0) {
        spawnTree();
    }
    if (Math.round(totalElapsedTime) % snowmanSpawnRate == 0) {
        spawnSnowman();
    } 
    if (Math.round(totalElapsedTime) % cloudSpawnRate == 0) {
    	spawnCloud();
    }
    
    if (Math.round(totalElapsedTime) % redFlagSpawnRate == 0) {
      spawnRedFlag();
  	}
  	if (Math.round(totalElapsedTime) % blueFlagSpawnRate == 0) {
      spawnBlueFlag();
  	}
  
    // ======================================================
    console.log(totalElapsedTime);
    // Increase speed of trees as game progresses
    if (Math.round(totalElapsedTime) % 1000 == 0) {
        baseSpeed += speedIncrease;
        if (treeSpawnRate > 20) {
            treeSpawnRate -= 10;
        }
        if (snowmanSpawnRate > 20) {
            snowmanSpawnRate -= 10;
        }
        if (redFlagSpawnRate > 20) {
            redFlagSpawnRate -= 10;
        }
        if (blueFlagSpawnRate > 20) {
            blueFlagSpawnRate -= 10;
        }
        cloudVerticalSpeed += speedIncrease;
    }

    // if (Math.round(totalElapsedTime) % 1000 == 0) {
    //     // snowmanSpeed += speedIncrease;

    // }

    // if (Math.round(totalElapsedTime) % 1000 == 0) {
    // //   redFlagSpeed += speedIncrease;
    // //   blueFlagSpeed += speedIncrease;

    // }

    // Check for collision
    treeSprites.forEach((treeSprite) => {
        if (hitTestRectangle(player, treeSprite)) {
            treeSprite.tint = 0xff3300;
            state = end;
          } 
    })

    snowmanSprites.forEach((snowmanSprite) => {
        if (hitTestRectangle(player, snowmanSprite)) {
            snowmanSprite.tint = 0xff3300;
            state = end;
          } 
    })

    redFlagSprites.forEach((redFlagSprite) => {
      if (hitTestRectangle(player, redFlagSprite) && (redFlagSprite.visible)) {
          redFlagSprite.visible = false;
          score = score + 50;
        } 
  	})

  	blueFlagSprites.forEach((blueFlagSprite) => {
      if (hitTestRectangle(player, blueFlagSprite) && (blueFlagSprite.visible)) {
          blueFlagSprite.visible = false;
          score = score + 100;
        } 
  	})

    //score = Math.floor(totalElapsedTime*0.3);
    if (!pause) {
    	score += delta*0.3;
    } 
}

function hitTestRectanglePoints(r1x, r1y, r1width, r1height,
    r2x, r2y, r2width, r2height) {

  //Define the variables we'll need to calculate
  let hit, combinedHalfWidths, combinedHalfHeights, vx, vy;

  //hit will determine whether there's a collision
  hit = false;

  //Find the center points of each sprite
  r1centerX = r1x + r1width / 2;
  r1centerY = r1y + r1height / 2;
  r2centerX = r2x + r2width / 2;
  r2centerY = r2y + r2height / 2;

  //Find the half-widths and half-heights of each sprite
  r1halfWidth = r1width / 2;
  r1halfHeight = r1height / 2;
  r2halfWidth = r2width / 2;
  r2halfHeight = r2height / 2;

  //Calculate the distance vector between the sprites
  vx = r1centerX - r2centerX;
  vy = r1centerY - r2centerY;

  //Figure out the combined half-widths and half-heights
  combinedHalfWidths = r1halfWidth + r2halfWidth;
  combinedHalfHeights = r1halfHeight + r2halfHeight;

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


function hitTestRectangle(r1, r2) {
    return hitTestRectanglePoints(r1.x, r1.y, r1.width, r1.height,
        r2.x, r2.y, r2.width, r2.height);
}


function spawnTree() {
    // set tree position
    let treeSprite = new PIXI.Sprite(treeTexture);
    let collided;
    do {
        let xSpawnPosition = Math.random() * (app.renderer.width - 1 - treeSprite.width) + 1;
        treeSprite.position.set(xSpawnPosition, (app.renderer.height - 100));
        collided = false;
        for (let i = 0; i < treeSprites.length; i++) {
            var otherTreeSprite = treeSprites[i];
            if (hitTestRectangle(treeSprite, otherTreeSprite) ) {
                collided = true;
                break;
            }
        } 
        if (!collided)
            for (let i = 0; i < snowmanSprites.length; i++) {
                var otherSnowmanSprite = snowmanSprites[i];
                if (hitTestRectangle(treeSprite, otherSnowmanSprite) ) {
                    collided = true;
                    break;
                }
            }
            for(let i = 0; i < redFlagSprites.length; i++) {
              var otherFlagSprite = redFlagSprites[i];
              if (hitTestRectangle(treeSprite, otherFlagSprite) ) {
                  collided = true;
                  break;
              }
            }
            for(let i = 0; i < blueFlagSprites.length; i++) {
              var otherFlagSprite = blueFlagSprites[i];
              if (hitTestRectangle(treeSprite, otherFlagSprite) ) {
                  collided = true;
                  break;
              }
            }
    } while (collided);

    gameScene.addChild(treeSprite);

    treeSprites.push(treeSprite);
}


function spawnSnowman() {
    // set tree position
    let snowmanSprite = new PIXI.Sprite(snowmanTexture);
    let collided;
    do {
        let xSpawnPosition = Math.random() * (app.renderer.width - 1 - snowmanSprite.width) + 1;
        snowmanSprite.position.set(xSpawnPosition, (app.renderer.height - 50));
        collided = false;
        for (let i = 0; i < treeSprites.length; i++) {
            var otherTreeSprite = treeSprites[i];
            if (hitTestRectangle(snowmanSprite, otherTreeSprite) ) {
                collided = true;
                break;
            }
        } 
        if (!collided)
            for (let i = 0; i < snowmanSprites.length; i++) {
                var otherSnowmanSprite = snowmanSprites[i];
                if (hitTestRectangle(snowmanSprite, otherSnowmanSprite) ) {
                    collided = true;
                    break;
                }
            }
            for (let i = 0; i < redFlagSprites.length; i++) {
              var otherFlagSprite = redFlagSprites[i];
              if (hitTestRectangle(snowmanSprite, otherFlagSprite) ) {
                  collided = true;
                  break;
              }
          	}
          	for (let i = 0; i < blueFlagSprites.length; i++) {
              var otherFlagSprite = blueFlagSprites[i];
              if (hitTestRectangle(snowmanSprite, otherFlagSprite) ) {
                  collided = true;
                  break;
              }
          	}
    } while (collided);
    gameScene.addChild(snowmanSprite);
    snowmanSprites.push(snowmanSprite);
}
function spawnRedFlag() {
  // set flag position
  let randomFlag = Math.random();
  if (randomFlag < 0.16)
  {
    redFlagSprite = new PIXI.Sprite(redFlagTextures[flagMappings["center"]]);
  }
  else if(randomFlag > 0.32 && randomFlag < 0.48){ 
    redFlagSprite = new PIXI.Sprite(redFlagTextures[flagMappings["left"]]);
  }
  else { 
    redFlagSprite = new PIXI.Sprite(redFlagTextures[flagMappings["right"]]);
  }

  let collided;
  do {
      let xSpawnPosition = Math.random() * (app.renderer.width - 1 - redFlagSprite.width) + 1;
      redFlagSprite.position.set(xSpawnPosition, (app.renderer.height - 100));
      collided = false;
      for (let i = 0; i < treeSprites.length; i++) {
          var otherTreeSprite = treeSprites[i];
          if (hitTestRectangle(redFlagSprite, otherTreeSprite) ) {
              collided = true;
              break;
          }
      } 
      if (!collided)
          for (let i = 0; i < snowmanSprites.length; i++) {
              var otherSnowmanSprite = snowmanSprites[i];
              if (hitTestRectangle(redFlagSprite, otherSnowmanSprite) ) {
                  collided = true;
                  break;
              }
          }
          for (let i = 0; i < redFlagSprites.length; i++) {
            var otherFlagSprite = redFlagSprites[i];
            if (hitTestRectangle(redFlagSprite, otherFlagSprite) ) {
                collided = true;
                break;
            }
        }
  } while (collided);
  gameScene.addChild(redFlagSprite);
  redFlagSprites.push(redFlagSprite);
}

function spawnBlueFlag() {
  // set flag position
  let randomFlag = Math.random();
  if (randomFlag < 0.16)
  {
    blueFlagSprite = new PIXI.Sprite(blueFlagTextures[flagMappings["center"]]);
  }
  else if(randomFlag > 0.64 && randomFlag < 0.80){ 
    blueFlagSprite = new PIXI.Sprite(blueFlagTextures[flagMappings["left"]]);
  }
  else{ 
    blueFlagSprite = new PIXI.Sprite(blueFlagTextures[flagMappings["right"]]);
  }
  let collided;
  do {
      let xSpawnPosition = Math.random() * (app.renderer.width - 1 - blueFlagSprite.width) + 1;
      blueFlagSprite.position.set(xSpawnPosition, (app.renderer.height - 100));
      collided = false;
      for (let i = 0; i < treeSprites.length; i++) {
          var otherTreeSprite = treeSprites[i];
          if (hitTestRectangle(blueFlagSprite, otherTreeSprite) ) {
              collided = true;
              break;
          }
      } 
      if (!collided)
          for (let i = 0; i < snowmanSprites.length; i++) {
              var otherSnowmanSprite = snowmanSprites[i];
              if (hitTestRectangle(blueFlagSprite, otherSnowmanSprite) ) {
                  collided = true;
                  break;
              }
          }
          for (let i = 0; i < blueFlagSprites.length; i++) {
            var otherFlagSprite = blueFlagSprites[i];
            if (hitTestRectangle(blueFlagSprite, otherFlagSprite) ) {
                collided = true;
                break;
            }
        }
  } while (collided);
  gameScene.addChild(blueFlagSprite);
  blueFlagSprites.push(blueFlagSprite);
}

function spawnCloud() {
	let cloudSprite = new PIXI.Sprite(cloudTextures[Math.floor(Math.random() * 2)]);
	cloudSprite.width *= 0.4;
	cloudSprite.height *= 0.4;
	cloudSprite.alpha = 0.8;
    let ySpawnPosition = Math.random() * (app.renderer.height - 1 - cloudSprite.height) + 1;
    cloudSprite.position.set(-80, ySpawnPosition);
    cloudContainer.addChild(cloudSprite);
    cloudSprites.push(cloudSprite);
}

function end() {
    gameScene.visible = false;
    cloudContainer.visible = false;
    gameOverScene.visible = true;
    scoreDisplay.anchor.set(0.5);
    scoreDisplay.x = 600;
    scoreDisplay.y = 400;
    // scoreDisplay.position.set(600,app.stage.height+200)
    // console.log(score);
    //All the code that should run at the end of the game
}