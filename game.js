
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

let player, state;


//This `setup` function will run when the image has loaded
function setup() {
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

    console.log("Setup done")

    player.position.set(app.renderer.width/2, app.renderer.height/2);
    app.stage.addChild(player);

    // set tree position
    let treeSprite = new PIXI.Sprite(texture2);
    treeSprite.position.set((Math.random() * (app.renderer.width - 1) + 1), (Math.random() * (app.renderer.height - 1) + 1));
    app.stage.addChild(treeSprite);

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
    player.vx = 0.1;
    player.x += player.vx;
}

function end() {
    //All the code that should run at the end of the game
}