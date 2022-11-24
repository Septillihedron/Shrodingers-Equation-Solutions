
const infinity = 100; // approximation for infinity
const epsilon = 1.0/infinity;

let cartesianToPolarMap = [];
let possibleKs = [];

let k = 1;
let kn = 0; // possibleKs[n]
let C0 = 1;
let radius = 1;
let angleShift = 0;

let coefficients = [];
let normalizingConstant = 1;

function initiate() {
    populatePossibleKs();
    caculateCoefficients();
    calculateNormalizingConstant();
}

function populateCartesianToPolarMap() {
    for (let py = 0; py < height; py++) {
        for (let px = 0; px < width; px++) {
            let x = (px - width/2)*scale;
            let y = (py - height/2)*scale;
            let r = sqrt(x*x + y*y);
            let a = atan2(x, y);
            cartesianToPolarMap[py*width + px] = {r: r, a: a};
        }
    }
}

function populatePossibleKs() {
    let zeros = [];
    for (let i=0; i<infinity; i+=1) {
        zeros.push(findZeroFrom(RfromK, i, infinity))
    }
    zeros.sort((a, b) => a-b);
    zeros.forEach(newK => {
        if (newK < 0) return;
        if (possibleKs.length >= 10) return;
        for (let i=0; i<possibleKs.length; i++) {
            if (abs(possibleKs[i] - newK) < epsilon) return;
        }
        possibleKs.push(newK);
    });
    possibleKs.sort((a, b) => a-b);
    k = possibleKs[kn]
}

// check if R(radius) with k = x is in a down slope, i.e R'(radius) < 0
function checkK(x) {
    return derivativeAt(RfromK, x) < 0;
}

function findZeroFrom(f, x, iterations) {
    for (let i=0; i<iterations; i++) {
        let fPrimeOfX = derivativeAt(f, x);
        if (fPrimeOfX == 0) return x;
        x -= f(x)/fPrimeOfX;
    }
    return x;
}

// the funtion R(radius) with k = x
function RfromK(x) {
    k = x;
    caculateCoefficients();
    return R(radius);
}

function derivativeAt(f, x) {
    return (f(x+epsilon) - f(x))/epsilon;
}

function caculateCoefficients() {
    // a_n = -(k^2) / (4n(n+|C0|)) * a_(n-1)
    coefficients[0] = 1;
    for(let n=1; n<=infinity; n++) {
        coefficients[n] = -sq(k)/(4*n*(n+abs(C0)))*coefficients[n-1];
        // if (abs(coefficients[n]) < 1e-50) break;
    }
}

function verifyNormalization() {
    return integral(0, 2*PI, a => {
        return integral(0, radius, r => {
            return sq(psi(r, a));
        });
    });
}

function calculateNormalizingConstant() {
    let S = integral(0, radius, r => sq(abs(R(r))));
    normalizingConstant = sqrt(1/(PI*S));
}

function probability(x, y) {
    let {r, a} = cartesianToPolarMap[y*width + x];
    let result = psi(r, a);
    return sq(result);
}

function psi(r, a) {
    if (C0 == 0) return normalizingConstant * R(r);
    return normalizingConstant * R(r) * sin(C0*(a + angleShift));
}

// R(r) = r^|C0| * (the sum from 0 to infinity of (a_n * r^(2n)))
function R(r) {
    let rSquared = r*r;
    let rTo2n = 1 // r^(2n)
    return pow(r, abs(C0)) * sum(0, coefficients.length-1, (n) => {
        let result = coefficients[n] * rTo2n;
        rTo2n *= rSquared; // update for the next n
        return result;
    });
}

// The sum from `from` to `to` of `f(n)`
function sum(from, to, f) {
    let sum = 0;
    for (let n = from; n <= to; n++) {
        sum += f(n);
    }
    return sum;
}

// The integral from `from` to `to` of f(x)dx
// trapezoidal approximation with intervals epsilon
function integral(from, to, f) {
    let sum = 0;
    for (let x=from; x<=to; x+=epsilon) {
        sum += epsilon*(f(x)+f(x+epsilon))/2;
    }
    return sum;
}
