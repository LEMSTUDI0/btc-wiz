const BLOB_TRANSITION_SPEED = 0.0003;





// Select the canvas element with the id 'scene'
var canvas = document.querySelector('#scene');

// Initialize a WebGL renderer with antialiasing enabled
var renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
});

// Create a new scene
var scene = new THREE.Scene();

// Initialize a PerspectiveCamera with a field of view of 100 degrees,
// aspect ratio based on window dimensions, near clipping plane at 0.1,
// and far clipping plane at 10000
var camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 10000);

// Set camera position
camera.position.set(60, 0, 220);

// Function to resize the renderer and update camera aspect ratio accordingly
function resizeRenderer() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}

// Call resizeRenderer once to set initial size
resizeRenderer();

// Get width and height of the canvas element
var width = canvas.offsetWidth;
var height = canvas.offsetHeight;

// Set background color of the renderer
renderer.setClearColor(0xb5ffe7);

// Listen for window resize event to adjust renderer size and camera aspect ratio
window.addEventListener('resize', resizeRenderer);

// Create and add HemisphereLight to the scene
var light = new THREE.HemisphereLight(0xffffff, 0x0C056D, 0.4);
scene.add(light);

// Create and add DirectionalLight to the scene
var light = new THREE.DirectionalLight(0xffff00, 0.3);
light.position.set(200, 300, 400);
scene.add(light);

// Clone DirectionalLight and add it to the scene with a different position
var light2 = light.clone();
light2.position.set(-200, 300, 400);
scene.add(light2);

// Create an IcosahedronGeometry with specified parameters
var geometry = new THREE.IcosahedronGeometry(120, 4);

// Iterate over each vertex in the geometry and store its original position
for (var i = 0; i < geometry.vertices.length; i++) {
    var vector = geometry.vertices[i];
    vector._o = vector.clone();
}

// Create a MeshPhongMaterial with specified properties
var material = new THREE.MeshPhongMaterial({
    emissive: 0x23f660,
    emissiveIntensity: 0.9,
    shininess: 0
});

// Create a mesh with the geometry and material and add it to the scene
var shape = new THREE.Mesh(geometry, material);
scene.add(shape);



var initialColor = new THREE.Color(0xff0000); // Red
var targetColor = new THREE.Color(0x0000ff); // Blue

var colorTween = {
    color: initialColor.clone() // Clone the initialColor to start the tween
};
// Function to update the vertices of the geometry based on Perlin noise
function updateVertices(a) {
    // Check if light color needs to be updated
    if (light.color.equals(initialColor)) {
        // Start tween to transition light color from initialColor to targetColor
        TweenMax.to(colorTween, 1, {
            color: targetColor,
            onUpdate: function () {
                // Update light color during animation
                light.color.copy(colorTween.color);
            }
        });
    } else if (light.color.equals(targetColor)) {
        // Start tween to transition light color from targetColor to initialColor
        TweenMax.to(colorTween, 1, {
            color: initialColor,
            onUpdate: function () {
                // Update light color during animation
                light.color.copy(colorTween.color);
            }
        });
    }

    for (var i = 0; i < geometry.vertices.length; i++) {
        var vector = geometry.vertices[i];
        vector.copy(vector._o);
        var perlin = noise.simplex3(
            (vector.x * 0.005) + (a * BLOB_TRANSITION_SPEED),
            (vector.y * 0.002) + (a * BLOB_TRANSITION_SPEED),
            (vector.z * 0.02)
        );
        var ratio = ((perlin * 0.4 * (mouse.y + 0.1)) + 0.8);
        // transitionLightColor();

        vector.multiplyScalar(ratio);

        geometry.verticesNeedUpdate = true;

    }
    geometry.verticesNeedUpdate = true;
}

// Function to continuously render the scene
function render(a) {
    requestAnimationFrame(render);
    updateVertices(a);
    renderer.render(scene, camera);
}

// Function to adjust canvas size and update camera aspect ratio on resize
function onResize() {
    canvas.style.width = '';
    canvas.style.height = '';
    width = canvas.offsetWidth;
    height = canvas.offsetHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

// Vector to store mouse position
var mouse = new THREE.Vector2(0.8, 0.5);

// Function to update mouse position on mouse movement
function onMouseMove(e) {
    TweenMax.to(mouse, 0.8, {
        y: (e.clientY / height),
        x: (e.clientX / width),
        ease: Power1.easeOut
    });
}

// Start rendering the scene
requestAnimationFrame(render);

// Listen for mouse movement event to update mouse position
window.addEventListener("mousemove", onMouseMove);

// Variable to store timeout for resizing
var resizeTm;

// Listen for window resize event to trigger resize function with a delay
window.addEventListener("resize", function () {
    resizeTm = clearTimeout(resizeTm);
    resizeTm = setTimeout(onResize, 200);
});
