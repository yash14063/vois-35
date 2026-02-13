/* ===========================================
   VisionCare AI - Main Application Controller
   =========================================== */

import Camera from '../ai/camera.js';
import PatientDetectionEngine from '../ai/patientDetection.js';
import GestureRecognitionEngine from '../ai/gestureRecognition.js';
import AlertManager from '../emergency/alertManager.js';
import EmergencySystem from '../emergency/emergencySystem.js';
import NotificationService from '../emergency/notificationService.js';

class VisionCareApp {

    constructor() {

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

        console.log("🚀 Initializing VisionCare System...");

        await this.notificationService.requestPermission();

        this.camera = new Camera(this.video);
        await this.camera.start();

        this.patientEngine = new PatientDetectionEngine(
            this.video,
            this.overlayCanvas
        );

        await this.patientEngine.loadModel();

        this.gestureEngine = new GestureRecognitionEngine(
            this.video,
            this.gestureCanvas
        );

        await this.gestureEngine.init();

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

        await this.patientEngine.start();
        await this.gestureEngine.start();

        this.systemActive = true;

        this.notificationService.sendInAppNotification({
            title: "System Started",
            message: "AI Monitoring Activated",
            type: "low"
        });
    }

    stopSystem() {

        if (!this.systemActive) return;

        this.patientEngine.stop();
        this.gestureEngine.stop();
        this.emergencySystem.resolveEmergency();

        this.systemActive = false;

        console.log("🛑 Monitoring Stopped");
    }

    attachUIControls() {

        const startBtn = document.getElementById("startBtn");
        const stopBtn = document.getElementById("stopBtn");
        const resolveBtn = document.getElementById("resolveBtn");

        if (startBtn)
            startBtn.addEventListener("click", () => this.startSystem());

        if (stopBtn)
            stopBtn.addEventListener("click", () => this.stopSystem());

        if (resolveBtn)
            resolveBtn.addEventListener("click", () =>
                this.emergencySystem.resolveEmergency()
            );
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const app = new VisionCareApp();
    await app.init();
    window.visionCareApp = app;
});

export default VisionCareApp;
