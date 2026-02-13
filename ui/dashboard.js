/**
 * VisionCare AI - Dashboard Controller
 * Central UI + Engine Integration Layer
 */

class DashboardController {
    constructor(config = {}) {
        this.config = config;
        this.vitalEngine = config.vitalEngine;
        this.spo2Engine = config.spo2Engine;
        this.riskEngine = config.riskEngine;
        this.chartEngine = config.chartEngine;

        this.currentPatient = null;
        this.init();
    }

    /**
     * Initialize Dashboard
     */
    init() {
        console.log("VisionCare Dashboard Initialized");
        this.bindUI();
    }

    /**
     * Attach UI Button Events
     */
    bindUI() {
        const emergencyBtn = document.getElementById("emergencyBtn");
        if (emergencyBtn) {
            emergencyBtn.addEventListener("click", () => {
                this.activateEmergencyMode();
            });
        }
    }

    /**
     * Load Patient Data
     */
    loadPatient(patientData) {
        this.currentPatient = patientData;
        this.updateUIHeader(patientData);
    }

    /**
     * Process Incoming Sensor Data
     */
    processVitals(vitalData, irSignal, redSignal) {
        if (!this.currentPatient) return;

        // Evaluate vitals
        const vitalResult = this.vitalEngine.evaluateVitals(vitalData);

        // Calculate SpO2 if raw signals given
        let spo2Result = null;
        if (irSignal && redSignal) {
            spo2Result = this.spo2Engine.calculateSpO2(irSignal, redSignal);
            vitalData.spo2 = spo2Result.spo2;
        }

        // Risk Evaluation
        const riskResult = this.riskEngine.evaluatePatient({
            age: this.currentPatient.age,
            vitals: vitalData,
            ecgData: this.currentPatient.ecgData || {},
            emergencyFlags: {}
        });

        this.updateUIVitals(vitalResult, spo2Result);
        this.updateRiskDisplay(riskResult);

        if (this.chartEngine) {
            this.chartEngine.updateChart(vitalData);
        }
    }

    /**
     * Update Header Information
     */
    updateUIHeader(patient) {
        const nameEl = document.getElementById("patientName");
        const ageEl = document.getElementById("patientAge");

        if (nameEl) nameEl.textContent = patient.name;
        if (ageEl) ageEl.textContent = `Age: ${patient.age}`;
    }

    /**
     * Update Vital Displays
     */
    updateUIVitals(vitalResult, spo2Result) {
        document.getElementById("heartRateValue").textContent =
            vitalResult.vitals.heartRate || "--";

        document.getElementById("bpValue").textContent =
            `${vitalResult.vitals.systolicBP || "--"} / ${vitalResult.vitals.diastolicBP || "--"}`;

        document.getElementById("tempValue").textContent =
            vitalResult.vitals.temperature || "--";

        if (spo2Result) {
            document.getElementById("spo2Value").textContent =
                spo2Result.spo2 + "%";
        }
    }

    /**
     * Update Risk Level Display
     */
    updateRiskDisplay(riskResult) {
        const riskEl = document.getElementById("riskLevel");
        const recommendationEl = document.getElementById("recommendation");

        if (!riskEl || !recommendationEl) return;

        riskEl.textContent = riskResult.level;
        recommendationEl.textContent = riskResult.recommendation;

        riskEl.className = "";
        riskEl.classList.add("risk-" + riskResult.level.toLowerCase());
    }

    /**
     * Emergency Mode
     */
    activateEmergencyMode() {
        document.body.classList.add("emergency-active");

        const alertSound = new Audio("alert.mp3");
        alertSound.play();

        console.log("Emergency Mode Activated");
    }
}

// Export for module usage
if (typeof module !== "undefined") {
    module.exports = DashboardController;
}

