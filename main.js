const BLOB_TRANSITION_SPEED = 0.0003;

var colorMap = {
    1: 0x5F2879,
    2: 0x00418D,
    3: 0x00C2DE,
    4: 0x00BA71,
    5: 0xFAD717,
    6: 0xFA8901,
    7: 0xF43545
};

var colormain = 0xffffff;

async function fetchData() {
    const response = await fetch('http://localhost:3000/data');
    const data = await response.json();
    document.getElementById('data').innerText = JSON.stringify(data);

            // Tutaj dodajemy logikę do pobrania i przetworzenia zawartości elementu 'data'
            const dataElement = document.getElementById('data').innerText;
            const dataObject = JSON.parse(dataElement);
            const value = dataObject.rainbowStatus;
            
            // Teraz 'value' zawiera cyfrę ze zmiennej 'data', którą możesz użyć do dalszej logiki
            console.log(value); // Wyświetli wartość 'rainbowStatus' jako liczbę
        
            // Kontynuacja twojej logiki, np. ustawienie koloru na podstawie wartości 'value'
            var colormain = colorMap[value];
            
            console.log(colormain);
            // Set background color of the renderer
            renderer.setClearColor(colormain);
        }

async function fetchBitcoinData() {
    const url = 'https://api.coingecko.com/api/v3/coins/bitcoin';

    try {
        const response = await fetch(url);
        const data = await response.json();

        const marketCap = data.market_data.market_cap.usd;
        const priceChange24h = data.market_data.price_change_percentage_24h;
        const currentPrice = data.market_data.current_price.usd;

        console.log(`Market Cap: $${marketCap}`);
        console.log(`Price Change (24h): ${priceChange24h}%`);
        console.log(`Current Price: $${currentPrice}`);

        // Tutaj możesz zapisać te dane do zmiennych globalnych lub robić z nimi co chcesz
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

fetchBitcoinData();

fetchData();

setInterval(fetchData, 60 *1000);
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
    emissive: 0x00BA71,
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
