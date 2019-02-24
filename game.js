
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

const mainCharacter = "images/skier.png";
const tree = "images/tree_a.png";

//Add the canvas that Pixi automatically created for you to the HTML document
document.body.appendChild(app.view);

//load an image and run the `setup` function when it's done
PIXI.loader
  .add([mainCharacter])
  .add([tree])
  .load(setup);

app.renderer.backgroundColor = 0xfcfcf9;


// Global variables
let player, state, treeSprite, gameScene, gameOverScene, message;

//This `setup` function will run when the image has loaded
function setup() {
    // Game Scene and Game Over Scene
    gameScene = new PIXI.Container();
    app.stage.addChild(gameScene);


    //Create the `tileset` sprite from the texture
    // let texture = PIXI.utils.TextureCache[mainCharacter];
    let texture = PIXI.BaseTexture.fromImage(mainCharacter);
    let texture2 = PIXI.utils.TextureCache[tree];

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

    let defaultTexture = textures[2];

    player = new PIXI.Sprite(defaultTexture);

    player.vx = 0;
    player.vy = 0;

    player.position.set(app.renderer.width/2, app.renderer.height/2);
    gameScene.addChild(player);

    // set tree position
    treeSprite = new PIXI.Sprite(texture2);
    treeSprite.position.set(800,400);
    // treeSprite.position.set((Math.random() * (app.renderer.width - 1) + 1), (Math.random() * (app.renderer.height - 1) + 1));
    gameScene.addChild(treeSprite);

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
    message.x = 120;
    message.y = app.stage.height / 2 - 32;
    gameOverScene.addChild(message);

    // Set the game state to play
    state = play;

    app.ticker.add(delta => gameLoop(delta));
}


function gameLoop(delta) {
    //Runs the current game `state` in a loop and renders the sprites
    state(delta)
}
  
function play(delta) {
    //All the game logic goes here
    player.vx = 1;
    player.x += player.vx;

    if (hitTestRectangle(player, treeSprite)) {
	  //There's a collision
		// message.text = "hit!";
		console.log("collision");
        treeSprite.tint = 0xff3300;
        state = end;
	} else {
	  //There's no collision
		// message.text = "No collision...";
		console.log("shermer");
    	// treeSprite.tint = 0xccff99;
	}
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

function end() {
    message.text = "You lose"
    gameScene.visible = false;
    gameOverScene.visible = true;
    // console.log("Game Over");
    //All the code that should run at the end of the game
}