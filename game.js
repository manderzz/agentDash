let type = "WebGL"

if(!PIXI.utils.isWebGLSupported()){
    type = "canvas"
}

var stage = new PIXI.Container();
var renderer = PIXI.autoDetectRenderer(256, 256);
document.body.appendChild(renderer.view);

PIXI.loader.add("images/cat.png").load(setup);

function setup() {
  var cat = new PIXI.Sprite(PIXI.loader.resources["images/cat.png"].texture);

  stage.addChild(cat);

  renderer.render(stage);
}

// //Create a Pixi Application
// let app = new PIXI.Application({ 
//     width: 256,         // default: 800
//     height: 256,        // default: 600
//     antialias: true,    // default: false
//     transparent: false, // default: false
//     resolution: 1       // default: 1
//     }
// );


// //Add the canvas that Pixi automatically created for you to the HTML document
// document.body.appendChild(app.view);

// //load an image and run the `setup` function when it's done
// PIXI.loader
//   .add("images/cat.png")
//   .load(setup);

// //This `setup` function will run when the image has loaded
// function setup() {

//   //Create the cat sprite
//   let cat = new PIXI.Sprite(PIXI.loader.resources["images/cat.png"].texture);
  
//   //Add the cat to the stage
//   app.stage.addChild(cat);
// }


// //Add the canvas that Pixi automatically created for you to the HTML document
// document.body.appendChild(app.view);

// // PIXI.utils.sayHello(type);

// // Create a new sprite using the texture
// // let skier = "images/mainCharacter.jpg";
// let skier = "images/cat.png";

// // let texture = PIXI.utils.TextureCache[skier];
// // let sprite = new PIXI.Sprite(texture);

// // Load the skier
// PIXI.loader
//   .add(skier)
//   .load(setup);

// // Create a skier sprite
// function setup() {
//   let sprite = new PIXI.Sprite(
//     PIXI.loader.resources[skier].texture
//   );

//   app.stage.addChild(sprite);
// }
