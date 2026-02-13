/* ===========================================
   VisionCare AI - Alert Management System
   alertManager.js
   =========================================== */

class AlertManager {

    constructor() {
        this.alertQueue = [];
        this.activeAlerts = [];
        this.soundEnabled = true;
        this.alertContainer = document.getElementById("alertContainer");
        this.audio = new Audio("/assets/alert.mp3");
        this.autoDismissTime = 5000; // 5 seconds
    }

    /* ===========================================
       TRIGGER NEW ALERT
    =========================================== */
    triggerAlert({ type, severity = "medium", message }) {

        const alert = {
            id: Date.now(),
            type,
            severity,
            message: message || this.generateDefaultMessage(type),
            timestamp: new Date().toISOString()
        };

        this.alertQueue.push(alert);
        this.activeAlerts.push(alert);

        this.renderAlert(alert);

        if (this.soundEnabled && severity === "high") {
            this.playSound();
        }

        console.warn("🚨 ALERT TRIGGERED:", alert);
    }

    /* ===========================================
       DEFAULT ALERT MESSAGES
    =========================================== */
    generateDefaultMessage(type) {

        const messages = {
            PATIENT_MISSING: "Patient not detected in camera view.",
            EMERGENCY_GESTURE: "Emergency gesture detected!",
            LOW_CONFIDENCE: "Low detection confidence.",
            MULTIPLE_PATIENTS: "More than expected patients detected.",
            SYSTEM_ERROR: "System anomaly detected."
        };

        return messages[type] || "Unknown alert detected.";
    }

    /* ===========================================
       RENDER ALERT TO UI
    =========================================== */
    renderAlert(alert) {

        if (!this.alertContainer) return;

        const alertDiv = document.createElement("div");
        alertDiv.className = `alert-card ${alert.severity}`;
        alertDiv.id = `alert-${alert.id}`;

        alertDiv.innerHTML = `
            <h4>${alert.type.replace("_", " ")}</h4>
            <p>${alert.message}</p>
            <small>${new Date(alert.timestamp).toLocaleTimeString()}</small>
            <button class="close-btn">Dismiss</button>
        `;

        alertDiv.querySelector(".close-btn").addEventListener("click", () => {
            this.dismissAlert(alert.id);
        });

        this.alertContainer.appendChild(alertDiv);

        setTimeout(() => {
            this.dismissAlert(alert.id);
        }, this.autoDismissTime);
    }

    /* ===========================================
       DISMISS ALERT
    =========================================== */
    dismissAlert(id) {

        const index = this.activeAlerts.findIndex(a => a.id === id);
        if (index !== -1) {
            this.activeAlerts.splice(index, 1);
        }

        const alertElement = document.getElementById(`alert-${id}`);
        if (alertElement) {
            alertElement.remove();
        }
    }

    /* ===========================================
       PLAY ALERT SOUND
    =========================================== */
    playSound() {
        this.audio.currentTime = 0;
        this.audio.play().catch(() => {
            console.warn("⚠ Sound autoplay blocked by browser");
        });
    }

    /* ===========================================
       TOGGLE SOUND
    =========================================== */
    toggleSound(enabled) {
        this.soundEnabled = enabled;
    }

    /* ===========================================
       CLEAR ALL ALERTS
    =========================================== */
    clearAll() {
        this.activeAlerts = [];
        if (this.alertContainer) {
            this.alertContainer.innerHTML = "";
        }
    }

    /* ===========================================
       GET ALERT HISTORY
    =========================================== */
    getAlertHistory() {
        return this.alertQueue;
    }
}

export default AlertManager;

