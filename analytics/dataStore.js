/* ======================================================
   VisionCare AI - Central Data Store
   Handles Patients, Risk Analysis & Logs
====================================================== */

class VisionCareDataStore {

    constructor() {

        this.patients = {
            1: this.createPatient(1),
            2: this.createPatient(2)
        };

        this.systemLogs = [];
        this.emergencyActive = false;

        this.settings = {
            heartAttackThreshold: 125,
            warningThreshold: 100,
            historyLimit: 50
        };
    }

    /* ================= CREATE PATIENT ================= */

    createPatient(id) {
        return {
            id: id,
            heartRate: 0,
            spo2: 98,
            riskLevel: "normal",
            history: [],
            lastUpdated: null,
            detected: false
        };
    }

    /* ================= UPDATE HEART RATE ================= */

    updateHeartRate(id, newHeartRate) {

        const patient = this.patients[id];
        if (!patient) return;

        patient.heartRate = newHeartRate;
        patient.lastUpdated = new Date();
        patient.detected = true;

        this.addToHistory(id, newHeartRate);
        this.evaluateRisk(id);

        this.logEvent(`Patient ${id} HR updated: ${newHeartRate}`);
    }

    /* ================= ADD HISTORY ================= */

    addToHistory(id, hr) {
        const patient = this.patients[id];

        patient.history.push({
            value: hr,
            timestamp: Date.now()
        });

        if (patient.history.length > this.settings.historyLimit) {
            patient.history.shift();
        }
    }

    /* ================= EVALUATE RISK ================= */

    evaluateRisk(id) {

        const patient = this.patients[id];
        const hr = patient.heartRate;

        if (hr >= this.settings.heartAttackThreshold) {
            patient.riskLevel = "critical";
            this.triggerEmergency(id);
        } 
        else if (hr >= this.settings.warningThreshold) {
            patient.riskLevel = "warning";
        } 
        else {
            patient.riskLevel = "normal";
        }
    }

    /* ================= TRIGGER EMERGENCY ================= */

    triggerEmergency(id) {

        this.emergencyActive = true;

        this.logEvent(`🚨 CRITICAL ALERT: Patient ${id} possible heart attack`);

        if (typeof window !== "undefined") {
            document.body.classList.add("emergency-mode");
        }
    }

    /* ================= CLEAR EMERGENCY ================= */

    clearEmergency() {
        this.emergencyActive = false;
        document.body.classList.remove("emergency-mode");
        this.logEvent("Emergency cleared");
    }

    /* ================= GET PATIENT ================= */

    getPatient(id) {
        return this.patients[id];
    }

    /* ================= GET ALL PATIENTS ================= */

    getAllPatients() {
        return this.patients;
    }

    /* ================= GET RISK SUMMARY ================= */

    getRiskSummary() {
        return Object.values(this.patients).map(p => ({
            id: p.id,
            risk: p.riskLevel
        }));
    }

    /* ================= SYSTEM LOGGING ================= */

    logEvent(message) {

        const entry = {
            message,
            timestamp: new Date().toISOString()
        };

        this.systemLogs.push(entry);

        if (this.systemLogs.length > 200) {
            this.systemLogs.shift();
        }

        console.log("[VisionCare Log]:", message);
    }

    getLogs() {
        return this.systemLogs;
    }

    /* ================= SIMULATION MODE ================= */

    simulateHeartRate(id) {

        const randomHR = Math.floor(60 + Math.random() * 90);
        this.updateHeartRate(id, randomHR);
    }

    simulateAllPatients() {
        this.simulateHeartRate(1);
        this.simulateHeartRate(2);
    }

    /* ================= FUTURE ESP32 DATA ================= */

    updateFromESP32(id, sensorData) {

        /*
          sensorData example:
          {
            heartRate: 85,
            spo2: 97
          }
        */

        const patient = this.patients[id];
        if (!patient) return;

        if (sensorData.heartRate) {
            this.updateHeartRate(id, sensorData.heartRate);
        }

        if (sensorData.spo2) {
            patient.spo2 = sensorData.spo2;
        }

        this.logEvent(`ESP32 Data Received for Patient ${id}`);
    }

    /* ================= RESET SYSTEM ================= */

    resetSystem() {

        this.patients[1] = this.createPatient(1);
        this.patients[2] = this.createPatient(2);
        this.systemLogs = [];
        this.emergencyActive = false;

        document.body.classList.remove("emergency-mode");

        this.logEvent("System reset completed");
    }
}

/* ================= EXPORT INSTANCE ================= */

const visionCareStore = new VisionCareDataStore();

export default visionCareStore;

