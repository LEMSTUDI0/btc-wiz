import { Gradient } from './gradient.js'

// Create your instance
const gradient = new Gradient()

// Call `initGradient` with the selector to your canvas
gradient.initGradient('#gradient-canvas')




function resizeCanvas() {
    var width = window.innerWidth;
    var height = window.innerHeight;

    // Set the size of both canvases to fill the screen
    var canvases = document.querySelectorAll('.canvas-container canvas');
    canvases.forEach(function (canvas) {
        canvas.width = width;
        canvas.height = height;
    });

    

    // // For the overlay canvas
    // var overlayContext = document.getElementById("overlayCanvas").getContext("webgl");
    // overlayContext.clearRect(0, 0, width, height); // Clear previous drawings
    // // overlayContext.fillStyle = "rgba(255, 0, 0, 1)"; // Semi-transparent red
    // // overlayContext.fillRect(50, 50, 100, 100); // Example: drawing a rectangle
}

// Resize the canvas when the window size changes
window.addEventListener('resize', resizeCanvas, false);
// Ensure the canvas is resized to the current window size on initial load
window.addEventListener('load', resizeCanvas, false);