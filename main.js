document.addEventListener('DOMContentLoaded', function () {
    const changeButton = document.getElementById('changeBackground');
    const background1 = document.querySelector('.background1');
    const background2 = document.querySelector('.background2');

    changeButton.addEventListener('click', function () {
        background1.classList.toggle('active');
        background2.classList.toggle('active');
    });
});



// Assuming you have a <canvas> element in your HTML with id="myCanvas"
const scene = new THREE.Scene();
// scene.background = new THREE.Color(0x000000); // Set to black for now, will be made transparent later
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('viz'), alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0); // Make background transparent

const geometry = new THREE.SphereGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);

camera.position.z = 500;

const animate = function () {
    requestAnimationFrame(animate);

    sphere.rotation.x += 0.01;
    sphere.rotation.y += 0.01;

    renderer.render(scene, camera);
};

animate();
