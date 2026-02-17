// Constants
const COST_PER_SPIN = 5;
const WIN_RATE = 0.17;
const REEL_INTERVAL = 75;
const SPIN_DURATIONS = [1000, 1300, 1600];
const RESULT_CHECK_DELAY = 1700;
const BUTTON_PRESS_DURATION = 850;

const PRIZES = {
    grayCat: 5,
    orangeCat: 15,
    rainbowCat: 50
};

const WEIGHTED_CATS = [
    "grayCat.png", "grayCat.png", "grayCat.png",
    "orangeCat.png", "orangeCat.png",
    "rainbowCat.png",
];

const ALL_CATS = ["grayCat.png", "orangeCat.png", "rainbowCat.png"];

// Win handlers map - maps each winning cat to its prize, sound, expression, and message
const WIN_HANDLERS = {
    "grayCat.png": {
        prize: PRIZES.grayCat,
        sound: 'grayWin',
        expression: "grayCatWin",
        message: "You win 5 coins!"
    },
    "orangeCat.png": {
        prize: PRIZES.orangeCat,
        sound: 'orangeWin',
        expression: "orangeCatWin",
        message: "You win 15 coins!"
    },
    "rainbowCat.png": {
        prize: PRIZES.rainbowCat,
        sound: 'rainbowWin',
        expression: "jackpot",
        message: "JACKPOT! You win 50 coins!"
    }
};

// Audio setup
const SOUNDS = {
    spin: new Audio('assets/sounds/spin.mp3'),
    meow: new Audio('assets/sounds/meow.mp3'),
    grayWin: new Audio('assets/sounds/grayWin.wav'),
    orangeWin: new Audio('assets/sounds/orangeWin.wav'),
    rainbowWin: new Audio('assets/sounds/rainbowWin.wav'),
    lose: new Audio('assets/sounds/lose.mp3')
};

// Game state
let coins = 100;
let isSpinning = false;

// DOM elements
const elements = {
    slot1: document.getElementById('slot1'),
    slot2: document.getElementById('slot2'),
    slot3: document.getElementById('slot3'),
    machineFace: document.getElementById('machine-face'),
    coinsDisplay: document.getElementById('coinAmount'),
    spinButton: document.getElementById('spinButton'),
    buttonImage: document.getElementById('buttonImage'),
    winMessage: document.getElementById('winMessage')
};

// Event listeners
elements.spinButton.addEventListener('click', handleSpinClick);

// Core game functions
function handleSpinClick() {
    elements.buttonImage.src = 'assets/others/buttonOn.png';
    setTimeout(() => {
        elements.buttonImage.src = 'assets/others/buttonOff.png';
    }, BUTTON_PRESS_DURATION);
    
    spinMachine();
}

function spinMachine() {
    if (!canSpin()) return;
    
    deductCoins();
    playSpinSounds();
    setExpression("meow");
    
    const results = generateSpinResults();
    animateAllReels(results);
    scheduleResultCheck(results);
}

function canSpin() {
    if (isSpinning) return false;
    if (coins < COST_PER_SPIN) {
        setExpression("broken");
        return false;
    }
    return true;
}

function deductCoins() {
    coins -= COST_PER_SPIN;
    updateCoinsDisplay();
}

function playSpinSounds() {
    SOUNDS.spin.currentTime = 0;
    SOUNDS.meow.currentTime = 0;
    SOUNDS.spin.play();
    SOUNDS.meow.play();
}

function generateSpinResults() {
    const isWin = Math.random() < WIN_RATE;
    
    if (isWin) {
        const winningCat = WEIGHTED_CATS[Math.floor(Math.random() * WEIGHTED_CATS.length)];
        return [winningCat, winningCat, winningCat];
    }
    
    return [
        getRandomCat(),
        getRandomCat(),
        getRandomCat()
    ];
}

function getRandomCat() {
    return ALL_CATS[Math.floor(Math.random() * ALL_CATS.length)];
}

function animateAllReels(results) {
    isSpinning = true;

    spinReel(elements.slot1, results[0], SPIN_DURATIONS[0]);
    spinReel(elements.slot2, results[1], SPIN_DURATIONS[1]);
    spinReel(elements.slot3, results[2], SPIN_DURATIONS[2]);
}

function spinReel(slotImg, finalCat, duration = 1000, interval = 75) {
    const spinInterval = setInterval(() => {
        const randomCat = ALL_CATS[Math.floor(Math.random() * ALL_CATS.length)];
        slotImg.src = `assets/cats/${randomCat}`;
    }, interval);

    setTimeout(() => {
        clearInterval(spinInterval);
        slotImg.src = `assets/cats/${finalCat}`;
    }, duration);
}

function scheduleResultCheck(results) {
    setTimeout(() => {
        checkResult(results);
        isSpinning = false;
    }, RESULT_CHECK_DELAY);
}

function checkResult(results) {
    const [a, b, c] = results;
    
    if (a === b && b === c && WIN_HANDLERS[a]) {
        handleWin(WIN_HANDLERS[a]);
    } else {
        handleLoss();
    }
    
    updateCoinsDisplay();
    checkIfBroke();
}

function handleWin(winData) {
    coins += winData.prize;
    SOUNDS[winData.sound].play();
    setExpression(winData.expression);
    showConfetti();
    showWinMessage(winData.message);
}

function handleLoss() {
    setExpression("lose");
}

function checkIfBroke() {
    if (coins <= 0) {
        setTimeout(() => {
            SOUNDS.lose.play();
            setExpression("broken");
            disableMachineTemporarily();
        }, 1000);
    }
}

// UI update functions
function updateCoinsDisplay() {
    elements.coinsDisplay.textContent = coins;
}

function setExpression(name) {
    elements.machineFace.src = `assets/expressions/${name}.png`;
}

function showWinMessage(text) {
    elements.winMessage.textContent = text;
    elements.winMessage.style.display = 'block';

    setTimeout(() => {
        elements.winMessage.style.display = 'none';
    }, 3500);
}

// Machine state functions
function disableMachineTemporarily() {
    elements.spinButton.disabled = true;
    elements.buttonImage.src = 'assets/others/buttonOff.png';
    showWinMessage("You broke the machine... Repairing in 2 minutes!");

    setTimeout(() => {
        coins = 100;
        updateCoinsDisplay();
        elements.spinButton.disabled = false;
        elements.buttonImage.src = 'assets/others/buttonOff.png';
        setExpression("idle");
    }, 2 * 60 * 1000); // 2 minutes
}

// Confetti animation
function showConfetti() {
    const duration = 1500;
    const end = Date.now() + duration;

    (function frame() {
        confetti({
            particleCount: 5,
            spread: 60,
            startVelocity: 20,
            gravity: 1.3,
            ticks: 80,
            origin: { y: 0.6 }
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    })();
}