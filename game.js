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

//Add the canvas that Pixi automatically created for you to the HTML document
document.body.appendChild(app.view);

//load an image and run the `setup` function when it's done
PIXI.loader
  .add([mainCharacter])
  .load(setup);

app.renderer.backgroundColor = 0xfcfcf9;


//This `setup` function will run when the image has loaded
function setup() {
    //Create the `tileset` sprite from the texture
    // let texture = PIXI.utils.TextureCache[mainCharacter];
    let texture = PIXI.BaseTexture.fromImage(mainCharacter);

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

    let player = new PIXI.Sprite(defaultTexture);

    player.position.set(app.renderer.width/2, app.renderer.height/2);
    app.stage.addChild(player);

    app.renderer.render();

}