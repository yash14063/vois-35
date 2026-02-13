/* ===========================================
   VisionCare AI - Dual Patient Detection
   faceRecognition.js
   =========================================== */

import * as faceapi from 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.esm.js'

class FaceRecognitionEngine {
    constructor(videoElement, canvasElement) {
        this.video = videoElement;
        this.canvas = canvasElement;
        this.ctx = this.canvas.getContext("2d");
        this.isModelLoaded = false;
        this.maxPatients = 2;
        this.detectedPatients = [];
        this.animationFrameId = null;
    }

    /* ===========================================
       MODEL LOADING
    =========================================== */
    async loadModels() {
        const MODEL_URL = '/models';

        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);

        console.log("✅ Face Models Loaded");
        this.isModelLoaded = true;
    }

    /* ===========================================
       START DETECTION LOOP
    =========================================== */
    async startDetection() {
        if (!this.isModelLoaded) {
            console.error("❌ Models not loaded");
            return;
        }

        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;

        const displaySize = {
            width: this.video.videoWidth,
            height: this.video.videoHeight
        };

        faceapi.matchDimensions(this.canvas, displaySize);

        const detectLoop = async () => {
            const detections = await faceapi.detectAllFaces(
                this.video,
                new faceapi.TinyFaceDetectorOptions()
            ).withFaceLandmarks().withFaceDescriptors();

            const resizedDetections = faceapi.resizeResults(detections, displaySize);

            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            this.detectedPatients = [];

            resizedDetections.slice(0, this.maxPatients).forEach((detection, index) => {

                const box = detection.detection.box;

                const label = `Patient ${index + 1}`;
                const drawBox = new faceapi.draw.DrawBox(box, {
                    label: label
                });

                drawBox.draw(this.canvas);

                this.detectedPatients.push({
                    id: index + 1,
                    confidence: detection.detection.score.toFixed(2),
                    x: box.x,
                    y: box.y,
                    width: box.width,
                    height: box.height,
                    timestamp: new Date().toISOString()
                });

            });

            this.updateUI();
            this.animationFrameId = requestAnimationFrame(detectLoop);
        };

        detectLoop();
    }

    /* ===========================================
       UPDATE PATIENT PANEL UI
    =========================================== */
    updateUI() {
        const panel = document.getElementById("patientPanel");

        if (!panel) return;

        panel.innerHTML = "";

        this.detectedPatients.forEach(patient => {
            const card = document.createElement("div");
            card.className = "patient-card";

            card.innerHTML = `
                <h3>Patient ${patient.id}</h3>
                <p>Confidence: ${patient.confidence}</p>
                <p>Detected At: ${new Date(patient.timestamp).toLocaleTimeString()}</p>
            `;

            panel.appendChild(card);
        });
    }

    /* ===========================================
       STOP DETECTION
    =========================================== */
    stopDetection() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        console.log("🛑 Detection Stopped");
    }

    /* ===========================================
       GET DETECTED DATA
    =========================================== */
    getPatientData() {
        return this.detectedPatients;
    }
}

export default FaceRecognitionEngine;

