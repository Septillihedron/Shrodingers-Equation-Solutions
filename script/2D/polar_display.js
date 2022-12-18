
let scale;

let sliders = {
    kn: null, // possibleKs[n]
    C0: null,
    radius: null,
    angleShift: null
}

function setup() {
    createCanvas(512, 512);
    scale = 4.0/max(width, height);
    colorMode(HSB);
    pixelDensity(1);

    populateCartesianToPolarMap();
    populatePossibleKs();
    createSliders();
    onSliderChanged();
}

function createSliders() {
    sliders.kn = createSlider(0, possibleKs.length-1, 0, 1);
    sliders.C0 = createSlider(0, 3, 1, 1);
    sliders.radius = createSlider(epsilon, 5, 1, 0);
    sliders.angleShift = createSlider(0, 2*PI, 0, 0);

    for (const sliderName in sliders) {
        sliders[sliderName].input(onSliderChanged);
    }
}

function onSliderChanged() {
    updateParameters();
    initiate();
    graph();
}

function updateParameters() {
    kn = sliders.kn.value();
    C0 = sliders.C0.value();
    radius = sliders.radius.value();
    angleShift = sliders.angleShift.value();
}

function colorMap(v) {
    return color(((360*v)%360+360)%360, 100, 100).levels;
}

function draw() {
    strokeWeight(1);
    let measured = 0;
    // while (measured < 2000) measured += measure(floor(random(width)), floor(random(height)));
}

function measure(x, y) {
    let p = probability(x, y);
    if (p > random()) {
        stroke(193, 100, 100, 0.05);
        point(x, y);
        return true;
    }
    return false;
}

function graph(graphic) {

    if (graphic === undefined) {
        loadPixels();
        graphic = {
            loadPixels,
            pixels,
            updatePixels,
            height,
            width
        };
    } else {
        graphic.loadPixels();
    }

    for (let y = 0; y < graphic.height; y++) {
        for (let x = 0; x < graphic.width; x++) {
            setPixel(graphic.pixels, x, y, colorMap(probability(x, y)));
        }
    }

    graphic.updatePixels();

    noFill();
    stroke(0);
    strokeWeight(4);
    ellipse(width/2, height/2, 2*radius/scale+2, 2*radius/scale+2);
}

function setPixel(pixels, x, y, [r, g, b]) {
    let i = (y*width + x)*4;
    pixels[i+0] = r;
    pixels[i+1] = g;
    pixels[i+2] = b;
    pixels[i+3] = 255;
}

function keyPressed() {
    if (key == ' ') {
        saveCanvas("PolarWaveFunction", "png");
    }
}

