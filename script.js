const video = document.getElementById("video");
const canvas = document.getElementById("output");
const ctx = canvas.getContext("2d");

const tips = [4, 8, 12, 16, 20];
const pips = [3, 6, 10, 14, 18];

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function countFingers(lm) {
  const fingers = [];

  // thumb logic
  const thumb_tip = lm[tips[0]].x;
  const thumb_pip = lm[pips[0]].x;
  const thumb_mcp = lm[2].x;
  const wrist_x = lm[0].x;

  if (thumb_mcp > wrist_x) {
    fingers.push(thumb_tip > thumb_pip ? 1 : 0);
  } else {
    fingers.push(thumb_tip < thumb_pip ? 1 : 0);
  }

  // other 4 fingers
  for (let i = 1; i < 5; i++) {
    const tip = lm[tips[i]];
    const pip = lm[pips[i]];
    fingers.push(distance(tip, lm[0]) > distance(pip, lm[0]) ? 1 : 0);
  }

  return fingers.reduce((a, b) => a + b, 0);
}

function onResults(results) {
  ctx.canvas.width = video.videoWidth;
  ctx.canvas.height = video.videoHeight;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

  let totalCount = 0;
  let handCount = 0;

  if (results.multiHandLandmarks) {
    handCount = results.multiHandLandmarks.length;

    for (const landmarks of results.multiHandLandmarks) {
      drawingUtils.drawConnectors(ctx, landmarks, Hands.HAND_CONNECTIONS);
      drawingUtils.drawLandmarks(ctx, landmarks);

      const count = countFingers(landmarks);
      totalCount += count;

      const cx = landmarks[9].x * canvas.width;
      const cy = landmarks[9].y * canvas.height;

      ctx.fillStyle = "lime";
      ctx.font = "30px Arial";
      ctx.fillText(count, cx - 20, cy - 20);
    }
  }

  ctx.fillStyle = "cyan";
  ctx.font = "28px Arial";
  ctx.fillText(`Finger Count: ${totalCount}`, 10, 30);
  ctx.fillStyle = "yellow";
  ctx.fillText(`Hands: ${handCount}`, 10, 70);
}

const hands = new Hands({
  locateFile: (file) =>
    `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});

hands.setOptions({
  maxNumHands: 2,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.5
});

hands.onResults(onResults);

const camera = new Camera(video, {
  onFrame: async () => {
    await hands.send({ image: video });
  },
  width: 1280,
  height: 720
});

camera.start();
