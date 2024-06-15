// DOM elements
let videoElement = document.getElementById('input_video');
let canvasElement = document.getElementById('output_canvas');
let canvasCtx = canvasElement.getContext('2d');
let gestureDisplay = document.getElementById('gesture');
let modelLoadingTime = document.getElementById('modelLoadingTime');

// Constants and thresholds
let x_threshold = 0.15;
let y_threshold = 0.15;
let squat_threshold = 1.25;
let kick_threshold = 0.15;

// State variables
let gesture = "none";
let gesture_log = Array.from({ length: 10 }, () => "n"); // log of previous 10 frames
let loaded = false;
let model;
let showCamera = true;
let squatForDown = false;
let kickForLateral = false;

// Load the TensorFlow.js model
async function loadModel() {
    const timestamp = new Date().toLocaleString();
    try {
        model = await tf.loadLayersModel('../model/model.json');
        console.log(`Model loaded at: ${timestamp}`);
        modelLoadingTime.textContent = timestamp;
        loaded = true;
    } catch (error) {
        console.error('Error loading model:', error);
    }
}

// Run inference with the loaded model
async function runInference(model, data) {
    if (!model) {
        throw new Error('Model not loaded.');
    }
    const poseLandmarks = data.slice(0, 18); // assuming poseLandmarks is an array with at least 18 elements
    const inputData = tf.tensor2d([poseLandmarks], [1, 18]);
    const output = await model.predict(inputData);
    return output;
}

// Handle results from the pose detection
async function onResults(results) {
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    if (results.poseLandmarks) {
        for (let i = 0; i < 11; i++) {
            results.poseLandmarks[i] = [NaN, NaN, NaN]; // remove facial landmarks
        }
    }

    if (showCamera) {
        canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
        drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, { color: '#FF147D', lineWidth: 10 });
    } else {
        canvasCtx.rect(0, 0, canvasElement.width, canvasElement.height);
        canvasCtx.fillStyle = "#042736";
        canvasCtx.fill();
        drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, { color: '#FF147D', lineWidth: 20 });
    }
    canvasCtx.restore();

    if (results.poseLandmarks) {
        loaded = true;

        let leftHand = results.poseLandmarks[15];
        let leftShoulder = results.poseLandmarks[11];
        let rightHand = results.poseLandmarks[16];
        let rightShoulder = results.poseLandmarks[12];
        let rightKnee = results.poseLandmarks[26];
        let leftKnee = results.poseLandmarks[25];
        let rightHip = results.poseLandmarks[24];
        let leftHip = results.poseLandmarks[23];

        let x_diff = (leftHand.x - leftShoulder.x) + (rightHand.x - rightShoulder.x);
        let y_diff = (leftHand.y - leftShoulder.y) + (rightHand.y - rightShoulder.y);
        let s_diff = (leftKnee.y - leftShoulder.y) + (rightKnee.y - rightShoulder.y);
        let r_leg_diff = Math.abs(rightKnee.y - rightHip.y);
        let l_leg_diff = Math.abs(leftKnee.y - leftHip.y);

        gesture = "none";

        if (-y_diff > y_threshold) {
            gesture = "up";
        }

        if (!squatForDown) {
            if (y_diff > y_threshold) {
                gesture = "down";
            }
        }

        if (kickForLateral) {
            if (r_leg_diff < kick_threshold && l_leg_diff > kick_threshold) {
                gesture = "right";
            } else if (l_leg_diff < kick_threshold) {
                gesture = "left";
            }
        } else {
            if (x_diff > x_threshold) {
                gesture = "left";
            } else if (-x_diff > x_threshold) {
                gesture = "right";
            }
        }

        if (squatForDown) {
            if (s_diff < squat_threshold && Math.abs(r_leg_diff - l_leg_diff) < 0.05) {
                gesture = "down";
            }
        }

        gestureDisplay.innerHTML = gesture;
        gesture_log.shift();
        gesture_log.push(gesture[0]);

    }
}

let pose = new Pose({
    locateFile: (file) => {
        console.log(file);
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
    }
});

pose.setOptions({
    modelComplexity: 0,
    smoothLandmarks: true,
    enableSegmentation: true,
    smoothSegmentation: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

pose.onResults(onResults);

// Function to set pose model complexity
function setPoseModelComplexity(complexity) {
    pose.setOptions({ modelComplexity: complexity });
}

// Initialize the camera for capturing video input
let camera = new Camera(videoElement, {
    onFrame: async () => {
        await pose.send({ image: videoElement });
    },
    width: 1280,
    height: 720
});

camera.start();

loadModel();
