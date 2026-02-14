/* ===========================================
   VisionCare AI - Main Application Controller
   app.js
=========================================== */

/* FIXED IMPORT PATHS */

import Camera from '../ai/camera.js';
import PatientDetectionEngine from '../ai/patientDetection.js';
import GestureRecognitionEngine from '../ai/gestureEngine.js'; // FIXED NAME
import AlertManager from '../emergency/alertManager.js';
import EmergencySystem from '../emergency/emergencySystem.js';
import NotificationService from '../emergency/notificationService.js';

class VisionCareApp {

    constructor() {

        /* Correct element IDs from index.html */
        this.video = document.getElementById("video");
        this.overlayCanvas = document.getElementById("overlay");
        this.gestureCanvas = document.getElementById("gestureOverlay");

        this.camera = null;
        this.patientEngine = null;
        this.gestureEngine = null;

        this.alertManager = new AlertManager();
        this.emergencySystem = new EmergencySystem(this.alertManager);
        this.notificationService = new NotificationService();

        this.systemActive = false;
    }

    async init() {

        console.log("🚀 VisionCare Initializing...");

        if (!this.video) {
            console.error("❌ Video element not found");
            return;
        }

        /* Notification permission */
        await this.notificationService.requestPermission();

        /* Camera setup */
        this.camera = new Camera(this.video);

        try {
            await this.camera.start();
            console.log("✅ Camera started");
        } catch (err) {
            console.error("❌ Camera failed:", err);
            return;
        }

        /* Patient Detection */
        this.patientEngine = new PatientDetectionEngine(
            this.video,
            this.overlayCanvas
        );

        await this.patientEngine.loadModel();

        /* Gesture Recognition */
        this.gestureEngine = new GestureRecognitionEngine(
            this.video,
            this.gestureCanvas
        );

        await this.gestureEngine.init();

        /* Connect emergency events */
        this.patientEngine.onAlert((data) => {
            this.emergencySystem.handlePatientEvent(data);
        });

        this.gestureEngine.onGestureDetected = (data) => {
            this.emergencySystem.handleGestureEvent(data);
        };

        this.attachUIControls();

        console.log("✅ VisionCare Ready");
    }

    async startSystem() {

        if (this.systemActive) return;

        console.log("▶ Starting monitoring...");

        await this.patientEngine.start();
        await this.gestureEngine.start();

        this.systemActive = true;
    }

    stopSystem() {

        if (!this.systemActive) return;

        this.patientEngine.stop();
        this.gestureEngine.stop();

        this.systemActive = false;

        console.log("🛑 Monitoring stopped");
    }

    attachUIControls() {

        const startBtn = document.getElementById("startBtn");
        const stopBtn = document.getElementById("stopBtn");

        if (startBtn)
            startBtn.addEventListener("click", () => this.startSystem());

        if (stopBtn)
            stopBtn.addEventListener("click", () => this.stopSystem());
    }
}

export default VisionCareApp;


/* AUTO START */

document.addEventListener("DOMContentLoaded", async () => {

    const app = new VisionCareApp();
    await app.init();

    window.visionCareApp = app;

});
