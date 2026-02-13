/* ======================================================
   VisionCare AI - Camera Module
   Dual Patient Detection From Single Camera
====================================================== */

import visionCareStore from "./dataStore.js";
import statisticsEngine from "./statisticsEngine.js";

class CameraModule {

    constructor() {
        this.video = document.getElementById("camera-feed");
        this.overlay = document.getElementById("overlay");
        this.ctx = null;
        this.stream = null;
        this.detectionInterval = null;
        this.running = false;
    }

    /* ================= INITIALIZE CAMERA ================= */

    async initCamera() {

        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 720, height: 500 }
            });

            this.video.srcObject = this.stream;

            await this.video.play();

            this.ctx = this.overlay.getContext("2d");

            console.log("📷 Camera initialized successfully");

        } catch (error) {
            console.error("Camera access denied:", error);
        }
    }

    /* ================= START DETECTION LOOP ================= */

    startDetection() {

        if (this.running) return;
        this.running = true;

        this.detectionInterval = setInterval(() => {
            this.detectPatients();
        }, 2000); // every 2 seconds
    }

    /* ================= STOP DETECTION ================= */

    stopDetection() {

        clearInterval(this.detectionInterval);
        this.running = false;

        if (this.ctx) {
            this.ctx.clearRect(0, 0, this.overlay.width, this.overlay.height);
        }

        console.log("🛑 Detection stopped");
    }

    /* ================= SIMULATED DUAL PATIENT DETECTION ================= */

    detectPatients() {

        if (!this.ctx) return;

        const width = this.overlay.width;
        const height = this.overlay.height;

        this.ctx.clearRect(0, 0, width, height);

        // Split screen into two halves
        const leftZone = {
            x: 50,
            y: 100,
            w: width / 2 - 80,
            h: height - 200
        };

        const rightZone = {
            x: width / 2 + 30,
            y: 100,
            w: width / 2 - 80,
            h: height - 200
        };

        // Draw bounding boxes
        this.drawBox(leftZone, "Patient 1");
        this.drawBox(rightZone, "Patient 2");

        // Simulate heart rate detection
        const hr1 = this.simulateHeartRate();
        const hr2 = this.simulateHeartRate();

        visionCareStore.updateHeartRate(1, hr1);
        visionCareStore.updateHeartRate(2, hr2);

        // Run analytics
        statisticsEngine.generateFullAnalysis(1);
        statisticsEngine.generateFullAnalysis(2);
    }

    /* ================= DRAW BOUNDING BOX ================= */

    drawBox(zone, label) {

        this.ctx.strokeStyle = "#00ff88";
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(zone.x, zone.y, zone.w, zone.h);

        this.ctx.font = "16px Arial";
        this.ctx.fillStyle = "#00ff88";
        this.ctx.fillText(label, zone.x + 10, zone.y - 10);
    }

    /* ================= HEART RATE SIMULATION ================= */

    simulateHeartRate() {

        // Normal range 65 - 110
        let hr = Math.floor(65 + Math.random() * 60);

        // 10% chance of spike
        if (Math.random() < 0.1) {
            hr += Math.floor(20 + Math.random() * 30);
        }

        return hr;
    }

    /* ================= SHUTDOWN CAMERA ================= */

    shutdownCamera() {

        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }

        this.stopDetection();
        console.log("📷 Camera shutdown complete");
    }
}

/* ================= EXPORT INSTANCE ================= */

const cameraModule = new CameraModule();
export default cameraModule;

