/* ===========================================
   VisionCare AI - Emergency Response System
   emergencysystem.js
   =========================================== */

class EmergencySystem {

    constructor(alertManager) {
        this.alertManager = alertManager;
        this.emergencyActive = false;
        this.escalationTimer = null;
        this.escalationDelay = 10000; // 10 seconds
        this.currentEmergency = null;
        this.log = [];
    }

    /* ===========================================
       HANDLE PATIENT ALERT EVENTS
    =========================================== */
    handlePatientEvent(data) {

        if (data.type === "PATIENT_MISSING") {
            this.triggerEmergency({
                type: "PATIENT_MISSING",
                severity: "high",
                message: "Critical: Patient missing from monitoring zone."
            });
        }

        if (data.type === "LOW_CONFIDENCE") {
            this.triggerEmergency({
                type: "LOW_CONFIDENCE",
                severity: "medium",
                message: "Warning: Detection confidence dropped."
            });
        }
    }

    /* ===========================================
       HANDLE GESTURE EVENTS
    =========================================== */
    handleGestureEvent(data) {

        if (data.gesture === "Emergency Help") {
            this.triggerEmergency({
                type: "EMERGENCY_GESTURE",
                severity: "critical",
                message: `Patient ${data.patient} signaled emergency help.`
            });
        }
    }

    /* ===========================================
       TRIGGER EMERGENCY
    =========================================== */
    triggerEmergency(event) {

        if (this.emergencyActive) return;

        this.emergencyActive = true;
        this.currentEmergency = {
            ...event,
            timestamp: new Date().toISOString()
        };

        this.log.push(this.currentEmergency);

        this.alertManager.triggerAlert({
            type: event.type,
            severity: event.severity,
            message: event.message
        });

        console.error("🚑 EMERGENCY ACTIVATED:", this.currentEmergency);

        this.startEscalation();
    }

    /* ===========================================
       ESCALATION SYSTEM
    =========================================== */
    startEscalation() {

        this.escalationTimer = setTimeout(() => {

            this.alertManager.triggerAlert({
                type: "ESCALATION",
                severity: "critical",
                message: "Emergency not resolved. Escalating to higher authority."
            });

            console.warn("🚨 Emergency Escalated");

        }, this.escalationDelay);
    }

    /* ===========================================
       RESOLVE EMERGENCY
    =========================================== */
    resolveEmergency() {

        if (!this.emergencyActive) return;

        clearTimeout(this.escalationTimer);
        this.emergencyActive = false;

        this.alertManager.triggerAlert({
            type: "EMERGENCY_RESOLVED",
            severity: "low",
            message: "Emergency resolved successfully."
        });

        console.log("✅ Emergency Resolved");
    }

    /* ===========================================
       AUTO MONITORING CHECK
    =========================================== */
    monitorVitals(vitalData) {

        if (!vitalData) return;

        if (vitalData.heartRate > 130 || vitalData.heartRate < 40) {
            this.triggerEmergency({
                type: "HEART_RATE_ANOMALY",
                severity: "critical",
                message: `Abnormal heart rate detected: ${vitalData.heartRate} bpm`
            });
        }

        if (vitalData.oxygen < 85) {
            this.triggerEmergency({
                type: "LOW_OXYGEN",
                severity: "critical",
                message: `Critical oxygen level: ${vitalData.oxygen}%`
            });
        }
    }

    /* ===========================================
       GET EMERGENCY STATUS
    =========================================== */
    getStatus() {
        return {
            active: this.emergencyActive,
            current: this.currentEmergency
        };
    }

    /* ===========================================
       GET LOG HISTORY
    =========================================== */
    getEmergencyLog() {
        return this.log;
    }
}

export default EmergencySystem;

