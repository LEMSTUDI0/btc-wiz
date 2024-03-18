var BLOB_TRANSITION_SPEED = 0.0003;
var BLOB_SIZE = 0.8;
var colorMap = {
    1: 0x5F2879,
    2: 0x00418D,
    3: 0x00C2DE,
    4: 0x00BA71,
    5: 0xFAD717,
    6: 0xFA8901,
    7: 0xF43545
};
var currentRainbowStatusIndex = 0;
var colormain = 0xffffff;
var secondaryColor = 0xffffff;

// Zdefiniuj światła tutaj, aby były dostępne globalnie
var light;
var lightD1;
var lightD2;

function updateLightColor() {
    if (light && lightD1) {
        light.color.set(secondaryColor); // Aktualizacja światła półkulistego
        lightD1.color.set(secondaryColor); // Aktualizacja światła kierunkowego lightD1
    }
}
function updatematerialColor() {
    material.emissive.set(colormain); // Aktualizacja światła półkulistego
    material.emissiveIntensity = 0.8;

}

// Definicja materiału shaderowego dla tła z gradientem
var backgroundShaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
        colorTop: { type: "c", value: new THREE.Color(0x000000) },
        colorBottom: { type: "c", value: new THREE.Color(0x000000) },
        aspectRatio: { type: "f", value: window.innerWidth / window.innerHeight }
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
    uniform vec3 colorTop;
uniform vec3 colorBottom;
uniform float aspectRatio;
varying vec2 vUv;

void main() {
    vec2 center = vec2(0.5, 0.5); // Środek płaszczyzny UV
    vec2 uvOffset = vUv - center;
    // Skalowanie UV do zachowania kształtu koła na różnych proporcjach ekranu
    uvOffset.x *= aspectRatio;
    // Obliczanie odległości od środka (z normalizacją dla koła)
    float distance = length(uvOffset) * 2.0; // *2.0, aby rozciągnąć gradient na całą płaszczyznę
    // Używanie smoothstep do stworzenia miękkiego gradientu z dominacją colorBottom na środku
    float mixFactor = smoothstep(0.05, 1.0, distance); // Rozpoczęcie od 10% od środka

    vec3 color = mix(colorBottom, colorTop, mixFactor); // Odwrócenie kolejności mieszania
    gl_FragColor = vec4(color, 1.0);
}
`,

    side: THREE.DoubleSide
});


// Funkcja aktualizująca kolory tła
function updateBackgroundColors() {
        backgroundShaderMaterial.uniforms.colorTop.value.set(colormain);
        backgroundShaderMaterial.uniforms.colorBottom.value.set(secondaryColor);
}


async function fetchBitcoinRainbowColor() {
    const response = await fetch('http://localhost:3000/data');
    const data = await response.json();
    colormain = colorMap[data.rainbowStatus];
    currentRainbowStatusIndex = data.rainbowStatus;
    console.log("Color: ", data.rainbowStatus);
    // Set background color of the renderer
  // renderer.setClearColor(colormain);
    // Dodatkowa logika do aktualizacji secondaryColor
    // i wywołania funkcji updateLightColor
    updateLightColor(); // Możesz wywołać tę funkcję tutaj, jeśli chcesz od razu zaktualizować kolor
    updatematerialColor();
    console.log('glowny kolor', colormain);
    console.log('drugi kolor', secondaryColor);

}

async function fetchBitcoinData() {
    const url = 'https://api.coingecko.com/api/v3/coins/bitcoin';

    try {
        const response = await fetch(url);
        const data = await response.json();

        const marketCap = data.market_data.market_cap.usd;
        const priceChange24h = data.market_data.price_change_percentage_24h;
        const currentPrice = data.market_data.current_price.usd;

        // z tego miejsca
        console.log(`Market Cap: $${marketCap}`);
        console.log(`Price Change (24h): ${priceChange24h}%`);
        console.log(`Current Price: $${currentPrice}`);
        BLOB_SIZE = 0.5 * marketCap / 1028615751025;

        if (priceChange24h > 0) {
            secondaryColor = colorMap[currentRainbowStatusIndex + 1];
            console.log("secondaryColor", currentRainbowStatusIndex + 1);
        }
        else {
            secondaryColor = colorMap[currentRainbowStatusIndex - 1];
            console.log("secondaryColor", currentRainbowStatusIndex - 1);

        }

        // Tutaj możesz zapisać te dane do zmiennych globalnych lub robić z nimi co chcesz
    } catch (error) {
        console.error('Error fetching data:', error);
    }
    updateBackgroundColors()
}


fetchBitcoinRainbowColor();
fetchBitcoinData();

setInterval(fetchBitcoinRainbowColor, 60 * 1000);

setInterval(fetchBitcoinData, 10 * 1000);



// Select the canvas element with the id 'scene'
var canvas = document.querySelector('#scene');

// Initialize a WebGL renderer with antialiasing enabled
var renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
});

// Create a new scene
var scene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 10000);


// Set camera position
camera.position.set(60, 0, 220);



// Tworzenie płaszczyzny dla tła i dodanie do sceny
var backgroundGeometry = new THREE.PlaneGeometry(window.innerWidth, window.innerHeight); // Prosta geometria pokrywająca cały widok kamery
var backgroundMesh = new THREE.Mesh(backgroundGeometry, backgroundShaderMaterial);
scene.add(backgroundMesh);
backgroundMesh.position.set(0, 0, -0.01); // Aby upewnić się, że jest za wszystkimi innymi obiektami



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
var light = new THREE.HemisphereLight(0xffffff, 0x0C056D, 0.05);
scene.add(light);

// Create and add DirectionalLight to the scene
var lightD1 = new THREE.DirectionalLight(0xffff00, 0.3);
lightD1.position.set(200, 300, 400);
scene.add(lightD1);

// Clone DirectionalLight and add it to the scene with a different position
var lightD2 = light.clone();
lightD2.position.set(-200, 300, 400);
scene.add(lightD2);

// Create an IcosahedronGeometry with specified parameters
var geometry = new THREE.IcosahedronGeometry(120, 6);

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


    // nie dziala, nie wiem jak dostac sie do koloru ze sceny
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
            (vector.x * 0.007) + (a * BLOB_TRANSITION_SPEED),
            (vector.y * 0.002) + (a * BLOB_TRANSITION_SPEED),
            (vector.z * 0.006) + (a * BLOB_TRANSITION_SPEED),
        );
        var ratio = ((perlin * 0.1 ) + BLOB_SIZE);
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
// window.addEventListener("mousemove", onMouseMove);

// Variable to store timeout for resizing
var resizeTm;

// Listen for window resize event to trigger resize function with a delay
window.addEventListener("resize", function () {
    resizeTm = clearTimeout(resizeTm);
    resizeTm = setTimeout(onResize, 200);
});

