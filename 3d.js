$(document).ready(function() {

var  currentPriceOld = 0;

var marketCap = 0;
var priceChange24h = 0;
var currentPrice = 0;
var marketCapChangePercentage = 0;
var volume24h=0;
var oldColor = 0;
var spikesValue = 1;
var pricessingValue = 1;
var mainColor = 0;

const colorMap = [
    0x9A1202, // Red
    0x034732, // Green
];

function switchBackground(){
    const changeButton = document.getElementById('changeBackground');
    const background1 = document.querySelector('.background1');
    const background2 = document.querySelector('.background2');
    background1.classList.toggle('active');
    background2.classList.toggle('active');
}

async function fetchBtcDataBinance(apiKey) {
    const url = 'https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT';
  
    // const headers = {
    //   'X-MBX-APIKEY': apiKey
    // };
  
    try {
      const response = await fetch(url);
      const data = await response.json();
  
      // Check if the API call was successful
      if (!response.ok) {
        throw new Error(`API call failed: ${data.msg}`);
      }
  
      const result = {
        marketCapPriceChangePercentage: data.priceChangePercent,
        currentPrice: data.lastPrice,
        priceChange24h: data.priceChange,
        volumeChange24h: data.volume
      };
      console.log("binance", result);
  
      return result;
    } catch (error) {
      console.error('Error fetching data:', error.message);
      throw error;
    }
  }
  
  // Usage example (Replace 'your_api_key_here' with your actual Binance API key)
  fetchBtcDataBinance('your_api_key_here')
    .then(data => console.log(data))
    .catch(error => console.error('Error in fetching data:', error));


function formatNumberByThousands(number) {
    // Convert the input to a string and split at the decimal point
    const parts = number.toString().split('.');
    const integerPart = parts[0];

    // Check if the integer part is purely numeric
    if (!/^\d+$/.test(integerPart)) {
        throw new Error("Input must be a numeric value without non-numeric characters in the integer part.");
    }

    // Reverse the integer part to facilitate inserting spaces every three characters
    const reversed = integerPart.split('').reverse().join('');
    const spacedReversed = reversed.replace(/(\d{3})(?=\d)/g, '$1 ');

    // Concatenate the fractional part back if it exists
    const result = spacedReversed.split('').reverse().join('').trim();
    return parts.length > 1 ? result + '.' + parts[1] : result;
}

var currentPreviousPrice = 0; 
async function fetchBitcoinData() {
    const url = 'https://api.coingecko.com/api/v3/coins/bitcoin';
    const binanceResults = await fetchBtcDataBinance();
    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log(data);
        marketCap = formatNumberByThousands(data.market_data.market_cap.usd);
        // priceChange24h = binanceResults.priceChange24h;
        priceChange24h = data.market_data.price_change_percentage_24h;
        marketCapChangePercentage =data.market_data.market_cap_change_percentage_24h;
        // marketCapChangePercentage =binanceResults.marketCapPriceChangePercentage;
        // currentPrice = formatNumberByThousands(data.market_data.current_price.usd);
        currentPrice = formatNumberByThousands(binanceResults.currentPrice);
        // volume24h = formatNumberByThousands(binanceResults.volumeChange24h);
        volume24h = formatNumberByThousands(data.market_data.total_volume.usd);
        
        document.getElementById("marketCap").innerHTML = marketCap + ' USD';
        document.getElementById("marketCapChangePercentage").innerHTML = marketCapChangePercentage + ' %';
        document.getElementById("currentPrice").innerHTML = currentPrice + ' USD';
        document.getElementById("priceChange24h").innerHTML = priceChange24h + ' %';
        document.getElementById("volume24h").innerHTML = volume24h + ' USD';

        
        // console.log(`Market Cap: ${marketCap}, Price Change (24h): ${priceChange24h}%, Current Price: ${currentPrice}, 24h Volume: ${volume24h} marketCapChangePercent ${marketCapChangePercentage}`);
        if (currentPrice > currentPriceOld) {
            currentPreviousPrice = 0;
        }
        else {
            currentPreviousPrice = 1;
        }

        currentPriceOld = currentPrice;
        mainColor = colorMap[currentPreviousPrice];
        if (mainColor != oldColor){
            transitionColor(material,new THREE.Color(mainColor));
            switchBackground();
        }
        oldColor = mainColor;

        spikesValue =  marketCapChangePercentage / 7 + 1.5;
        pricessingValue = priceChange24h / 7 + 1.5;
        
    } catch (error) {
        console.error('Error fetching data:', error);
    }
    
}

fetchBitcoinData();
setInterval(fetchBitcoinData, 10 * 1000);

fetchBtcDataBinance();



function transitionColor(material, mainColor) {
    // Extract the starting color
    let startColor = {r: material.color.r, g: material.color.g, b: material.color.b};

    // Target color decomposed
    let targetColor = mainColor;

    // Create a new tween for the startColor object
    let colorTween = new TWEEN.Tween(startColor)
        .to({r: targetColor.r, g: targetColor.g, b: targetColor.b}, 7000) // Transition over 5000 milliseconds
        .onUpdate(function() {
            // Update the material color in the animation loop
            material.color.r = startColor.r;
            material.color.g = startColor.g;
            material.color.b = startColor.b;
        })
        .start(); // Start the tween
}







for(let i = 0, element; element = document.querySelectorAll('input[type="range"]')[i++];) {
    rangeSlider.create(element, {
        polyfill: true
    });
}



    let speedSlider = $('input[name="speed"]'),
        spikesSlider = $('input[name="spikes"]'),
        processingSlider = $('input[name="processing"]');

    let $canvas = $('#viz'),
        canvas = $canvas[0],
        renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            context: canvas.getContext('webgl2'),
            antialias: true,
            alpha: true
        }),
        simplex = new SimplexNoise();

    renderer.setSize($canvas.width(), $canvas.height());
    renderer.setPixelRatio(window.devicePixelRatio || 1);

    let scene = new THREE.Scene();
        let camera = new THREE.PerspectiveCamera(45, $canvas.width() / $canvas.height(), 0.1, 1000);

    camera.position.z = 5;

    let geometry = new THREE.SphereGeometry(.8, 128, 128);

    let material = new THREE.MeshPhongMaterial({
        color: 0x6F0C01,
        shininess: 100
    });

    let lightTop = new THREE.DirectionalLight(0xFFFFFF, .7);
    lightTop.position.set(0, 500, 200);
    lightTop.castShadow = true;
    scene.add(lightTop);

    let lightBottom = new THREE.DirectionalLight(0xFFFFFF, .25);
    lightBottom.position.set(0, -500, 400);
    lightBottom.castShadow = true;
    scene.add(lightBottom);

    let ambientLight = new THREE.AmbientLight(0x798296);
    scene.add(ambientLight);

    let sphere = new THREE.Mesh(geometry, material);

    scene.add(sphere);

    let update = () => {

        let time = performance.now() * 0.00001 * speedSlider.val() * Math.pow(pricessingValue, 3),
            spikes = spikesValue * pricessingValue;

        for(let i = 0; i < sphere.geometry.vertices.length; i++) {
            let p = sphere.geometry.vertices[i];
            p.normalize().multiplyScalar(1 + 0.3 * simplex.noise3D(p.x * spikes, p.y * spikes, p.z * spikes + time));
        }

        sphere.geometry.computeVertexNormals();
        sphere.geometry.normalsNeedUpdate = true;
        sphere.geometry.verticesNeedUpdate = true;

    }

    function animate() {
        update();
        renderer.render(scene, camera);
        TWEEN.update();
        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);

});
