/* ===========================================
   VisionCare AI - Dual Patient Gesture System
   gestureRecognition.js
   =========================================== */

import {
    Hands
} from "https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js";

import {
    Camera
} from "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js";

class GestureRecognitionEngine {
    constructor(videoElement, canvasElement) {
        this.video = videoElement;
        this.canvas = canvasElement;
        this.ctx = this.canvas.getContext("2d");

        this.maxPatients = 2;
        this.detectedGestures = [];
        this.hands = null;
        this.camera = null;
    }

    /* ===========================================
       INITIALIZE MEDIAPIPE HANDS
    =========================================== */
    async init() {

        this.hands = new Hands({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
            }
        });

        this.hands.setOptions({
            maxNumHands: 4, // Allow 2 patients (2 hands each)
            modelComplexity: 1,
            minDetectionConfidence: 0.6,
            minTrackingConfidence: 0.6
        });

        this.hands.onResults((results) => {
            this.processResults(results);
        });

        console.log("✅ Gesture Engine Initialized");
    }

    /* ===========================================
       START GESTURE DETECTION
    =========================================== */
    async start() {

        this.camera = new Camera(this.video, {
            onFrame: async () => {
                await this.hands.send({
                    image: this.video
                });
            },
            width: 640,
            height: 480
        });

        this.camera.start();
        console.log("🎥 Gesture Detection Started");
    }

    /* ===========================================
       PROCESS HAND LANDMARK RESULTS
    =========================================== */
    processResults(results) {

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.detectedGestures = [];

        if (!results.multiHandLandmarks) return;

        results.multiHandLandmarks.slice(0, 4).forEach((landmarks, index) => {

            const gesture = this.detectGesture(landmarks);

            this.drawHand(landmarks);

            this.detectedGestures.push({
                patient: Math.floor(index / 2) + 1,
                hand: index % 2 === 0 ? "Left/Right",
                gesture: gesture,
                timestamp: new Date().toISOString()
            });

        });

        this.updateUI();
    }

    /* ===========================================
       BASIC GESTURE CLASSIFIER
    =========================================== */
    detectGesture(landmarks) {

        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];
        const middleTip = landmarks[12];
        const ringTip = landmarks[16];
        const pinkyTip = landmarks[20];

        const isFist =
            indexTip.y > landmarks[6].y &&
            middleTip.y > landmarks[10].y &&
            ringTip.y > landmarks[14].y &&
            pinkyTip.y > landmarks[18].y;

        const isOpenPalm =
            indexTip.y < landmarks[6].y &&
            middleTip.y < landmarks[10].y &&
            ringTip.y < landmarks[14].y &&
            pinkyTip.y < landmarks[18].y;

        const isHelpGesture =
            thumbTip.x < indexTip.x &&
            isOpenPalm;

        if (isFist) return "Closed Fist";
        if (isOpenPalm) return "Open Palm";
        if (isHelpGesture) return "Emergency Help";
        return "Unknown";
    }

    /* ===========================================
       DRAW HAND SKELETON
    =========================================== */
    drawHand(landmarks) {

        this.ctx.strokeStyle = "#00FFAA";
        this.ctx.lineWidth = 2;

        landmarks.forEach(point => {
            this.ctx.beginPath();
            this.ctx.arc(
                point.x * this.canvas.width,
                point.y * this.canvas.height,
                4,
                0,
                2 * Math.PI
            );
            this.ctx.fillStyle = "#00FFAA";
            this.ctx.fill();
        });
    }

    /* ===========================================
       UPDATE PATIENT GESTURE PANEL
    =========================================== */
    updateUI() {

        const panel = document.getElementById("gesturePanel");
        if (!panel) return;

        panel.innerHTML = "";

        this.detectedGestures.slice(0, this.maxPatients).forEach(data => {

            const card = document.createElement("div");
            card.className = "gesture-card";

            card.innerHTML = `
                <h3>Patient ${data.patient}</h3>
                <p>Gesture: ${data.gesture}</p>
                <p>Time: ${new Date(data.timestamp).toLocaleTimeString()}</p>
            `;

            panel.appendChild(card);
        });
    }

    /* ===========================================
       GET GESTURE DATA
    =========================================== */
    getGestureData() {
        return this.detectedGestures;
    }

    /* ===========================================
       STOP DETECTION
    =========================================== */
    stop() {
        if (this.camera) {
            this.camera.stop();
        }
        console.log("🛑 Gesture Detection Stopped");
    }
}

export default GestureRecognitionEngine;

