const videoElement = document.querySelector('.input_video');
const canvasElement = document.querySelector('.output_canvas');
const ctx = canvasElement.getContext('2d');

function countFingers(landmarks) {
    let count = 0;

    const tipIds = [4, 8, 12, 16, 20];
    const pipIds = [3, 6, 10, 14, 18];

    // Thumb
    count += landmarks[4].x < landmarks[3].x ? 1 : 0;

    // Other fingers
    for (let i = 1; i < 5; i++) {
        const tip = landmarks[tipIds[i]];
        const pip = landmarks[pipIds[i]];
        if (tip.y < pip.y) count++;
    }

    return count;
}

function onResults(results) {
    ctx.save();
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    ctx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

    if (results.multiHandLandmarks) {
        results.multiHandLandmarks.forEach(landmarks => {
            const fingers = countFingers(landmarks);
            document.getElementById("count").textContent = "Fingers: " + fingers;
        });
    }
    ctx.restore();
}

const hands = new Hands({
    locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});

hands.setOptions({
    maxNumHands: 2,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.5
});

hands.onResults(onResults);

const camera = new Camera(videoElement, {
    onFrame: async () => {
        await hands.send({ image: videoElement });
    }
});
camera.start();
