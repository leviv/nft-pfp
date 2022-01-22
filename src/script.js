import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import * as dat from "lil-gui";

/**
 * Base
 */
// Debug
const gui = new dat.GUI();
gui.destroy();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Textures
 */
const loadingManager = new THREE.LoadingManager();
const textureLoader = new THREE.TextureLoader(loadingManager);
const matcapTexture = textureLoader.load("textures/matcaps/8.png");
const trashTexture = textureLoader.load("trash.jpeg");

/**
 * Text
 */
const fontLoader = new FontLoader();
fontLoader.load("./fonts/helvetiker_regular.typeface.json", (font) => {
  const textGeometry = new TextGeometry("Twitter NFT Generator", {
    font,
    size: 0.5,
    height: 0.2,
    curveSegments: 15,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.02,
    bevelOffset: 0,
    bevelSegments: 4,
  });
  textGeometry.center();

  const material = new THREE.MeshNormalMaterial({});
  textGeometry.scale(1.5, 1.5, 1.5);
  const text = new THREE.Mesh(textGeometry, material);
  text.position.y = 3;

  scene.add(text);
});

/**
 * SVG Hexagon
 */
const svgMarkup = document.querySelector("svg").outerHTML;
const loader = new SVGLoader();
const svgData = loader.parse(svgMarkup);

// Group that will contain all of our paths
const svgGroup = new THREE.Group();
var materials = [
  new THREE.MeshNormalMaterial({
    normalMap: trashTexture,
  }),
  new THREE.MeshNormalMaterial({}),
];

// Loop through all of the parsed paths
svgData.paths.forEach((path, _i) => {
  const shapes = path.toShapes(true);

  // Each path has array of shapes
  shapes.forEach((shape, j) => {
    // Finally we can take each shape and extrude it
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: 0.1,
      bevelEnabled: true,
      bevelSegments: 15,
    });
    geometry.center();
    geometry.scale(3, 3, 3);

    // Create a mesh and add it to the group
    const mesh = new THREE.Mesh(geometry, materials);

    svgGroup.add(mesh);
  });
});

svgGroup.translateY(-0.25);
svgGroup.rotateY(1);
gui.add(svgGroup.position, "y").min(-5).max(5).step(0.001);
gui.add(svgGroup.rotation, "y").min(-5).max(5).step(0.001);
gui.add(svgGroup.rotation, "x").min(-5).max(5).step(0.001);
gui.add(svgGroup.rotation, "z").min(-5).max(5).step(0.001);

// Add our group to the scene (you'll need to create a scene)
scene.add(svgGroup);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 7;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 */

// Size of resulting image
const PFP_SIZE = 400;

// Padding to make it look like a hexagon when cropped into a circle
const PADDING_HEIGHT_PERCENTAGE = 0.0606796117;
const PADDING_WIDTH_PERCENTAGE = 0;

// Constants for the hex path
const HEX_WIDTH = 200;
const HEX_HEIGHT = 188;

// Set up the canvas
const canvas2d = document.getElementById("canvas");
const ctx = canvas2d.getContext("2d");

// Setup the user image loader
const imageLoader = document.getElementById("imageLoader");
imageLoader.addEventListener("change", handleImage, false);

// Grab the svg path
const path = document.querySelector("#hex path");
const hexPath = new Path2D(path.getAttribute("d"));

function handleImage(e) {
  const reader = new FileReader();
  reader.onload = function (event) {
    const img = new Image();
    img.onload = function () {
      var materials = [
        new THREE.MeshNormalMaterial({
          normalMap: textureLoader.load(img.src),
        }),
        new THREE.MeshNormalMaterial({}),
      ];
      svgGroup.children[0].material = materials;

      // Scale the canvas to be the correct size and centered around the image
      let scaleFactor, translateX, translateY;

      if (img.height / HEX_HEIGHT > img.width / HEX_WIDTH) {
        // Image is portrait
        scaleFactor = img.width / HEX_WIDTH;
        translateX = 0;
        translateY = (img.height - HEX_HEIGHT * scaleFactor) / 2;
      } else {
        // Image is landscape
        scaleFactor = img.height / HEX_HEIGHT;
        translateX = (img.width - HEX_WIDTH * scaleFactor) / 2;
        translateY = 0;
      }

      const paddingWidth = PADDING_WIDTH_PERCENTAGE * HEX_HEIGHT * scaleFactor;
      const paddingHeight = PADDING_HEIGHT_PERCENTAGE * HEX_WIDTH * scaleFactor;

      console.log(scaleFactor, translateX, translateY);

      let transformationMatrix = document
        .createElementNS("http://www.w3.org/2000/svg", "svg")
        .createSVGMatrix();
      transformationMatrix = transformationMatrix.translate(
        paddingWidth / 2,
        paddingHeight / 2
      );
      transformationMatrix = transformationMatrix.scale(scaleFactor);

      canvas2d.width = HEX_WIDTH * scaleFactor + paddingWidth;
      canvas2d.height = HEX_HEIGHT * scaleFactor + paddingHeight;

      console.log(canvas2d.width, canvas2d.height);

      // Clip the image to the svg path
      const scaledPath = new Path2D();
      scaledPath.addPath(hexPath, transformationMatrix);
      ctx.clip(scaledPath);

      // Draw the image
      ctx.drawImage(
        img, // image object
        translateX, // source X
        translateY, // source Y
        HEX_WIDTH * scaleFactor, // source width
        HEX_HEIGHT * scaleFactor, // source height
        paddingWidth / 2, // dest x
        paddingHeight / 2, // dest y
        HEX_WIDTH * scaleFactor, // dest width
        HEX_HEIGHT * scaleFactor // dest height
      );

      // create an image that will get our resized export as src
      const newImg = new Image();
      newImg.src = canvas2d.resizeAndExport(PFP_SIZE, PFP_SIZE);
      // document.body.appendChild(newImg);
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(e.target.files[0]);
}

canvas2d.resizeAndExport = function (width, height) {
  // create a new canvas
  const c = document.createElement("canvas");
  // set its width&height to the required ones
  c.width = width;
  c.height = height;
  // draw our canvas to the new one
  c.getContext("2d").drawImage(
    this,
    0,
    0,
    this.width,
    this.height,
    0,
    0,
    width,
    height
  );
  // return the resized canvas dataURL
  const image = c.toDataURL();
  const downloadLink = document.createElement("a");
  // Add the name of the file to the link
  downloadLink.download = "nft-pfp.png";
  // Attach the data to the link
  downloadLink.href = image;
  // Get the code to click the download link
  downloadLink.click();
};

/**
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 */

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  svgGroup.rotation.y = elapsedTime / 3;

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
