/* ===========================================
   VisionCare AI - Main Application Controller
   app.js
   =========================================== */

import Camera from './camera.js';
import PatientDetectionEngine from './patientDetection.js';
import GestureRecognitionEngine from './gestureRecognition.js';
import AlertManager from './alertManager.js';
import EmergencySystem from './emergencySystem.js';
import NotificationService from './notificationService.js';

class VisionCareApp {

    constructor() {

        /* Core Elements */
        this.video = document.getElementById("video");
        this.overlayCanvas = document.getElementById("overlay");
        this.gestureCanvas = document.getElementById("gestureOverlay");

        /* Systems */
        this.camera = null;
        this.patientEngine = null;
        this.gestureEngine = null;
        this.alertManager = new AlertManager();
        this.emergencySystem = new EmergencySystem(this.alertManager);
        this.notificationService = new NotificationService();

        this.systemActive = false;
    }

    /* ===========================================
       INITIALIZE APPLICATION
    =========================================== */
    async init() {

        console.log("🚀 Initializing VisionCare System...");

        /* Request Notification Permission */
        await this.notificationService.requestPermission();
        this.notificationService.connectToAlertManager(this.alertManager);

        /* Setup Camera */
        this.camera = new Camera(this.video);
        await this.camera.start();

        /* Setup Patient Detection */
        this.patientEngine = new PatientDetectionEngine(
            this.video,
            this.overlayCanvas
        );

        await this.patientEngine.loadModel();

        /* Setup Gesture Recognition */
        this.gestureEngine = new GestureRecognitionEngine(
            this.video,
            this.gestureCanvas
        );

        await this.gestureEngine.init();

        /* Connect Patient Alerts to Emergency System */
        this.patientEngine.onAlert((data) => {
            this.emergencySystem.handlePatientEvent(data);
        });

        /* Hook Gesture Emergency */
        this.gestureEngine.onGestureDetected = (data) => {
            this.emergencySystem.handleGestureEvent(data);
        };

        this.attachUIControls();

        console.log("✅ VisionCare Ready");
    }

    /* ===========================================
       START SYSTEM
    =========================================== */
    async startSystem() {

        if (this.systemActive) return;

        console.log("▶ Starting Monitoring System...");

        await this.patientEngine.start();
        await this.gestureEngine.start();

        this.systemActive = true;

        this.notificationService.sendInAppNotification({
            title: "System Started",
            message: "AI Monitoring Activated",
            type: "low"
        });
    }

    /* ===========================================
       STOP SYSTEM
    =========================================== */
    stopSystem() {

        if (!this.systemActive) return;

        this.patientEngine.stop();
        this.gestureEngine.stop();
        this.emergencySystem.resolveEmergency();

        this.systemActive = false;

        this.notificationService.sendInAppNotification({
            title: "System Stopped",
            message: "AI Monitoring Deactivated",
            type: "medium"
        });

        console.log("🛑 Monitoring Stopped");
    }

    /* ===========================================
       UI BUTTON CONTROLS
    =========================================== */
    attachUIControls() {

        const startBtn = document.getElementById("startBtn");
        const stopBtn = document.getElementById("stopBtn");
        const resolveBtn = document.getElementById("resolveBtn");

        if (startBtn) {
            startBtn.addEventListener("click", () => {
                this.startSystem();
            });
        }

        if (stopBtn) {
            stopBtn.addEventListener("click", () => {
                this.stopSystem();
            });
        }

        if (resolveBtn) {
            resolveBtn.addEventListener("click", () => {
                this.emergencySystem.resolveEmergency();
            });
        }
    }

    /* ===========================================
       SYSTEM STATUS
    =========================================== */
    getStatus() {
        return {
            active: this.systemActive,
            emergency: this.emergencySystem.getStatus(),
            alerts: this.alertManager.getAlertHistory(),
            notifications: this.notificationService.getHistory()
        };
    }
}

export default VisionCareApp;

/* ===========================================
   AUTO START WHEN PAGE LOADS
   =========================================== */

document.addEventListener("DOMContentLoaded", async () => {

    const app = new VisionCareApp();
    await app.init();

    /* Optional: Auto Start */
    // await app.startSystem();

    window.visionCareApp = app; // For debugging in console
});

