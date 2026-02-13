
/**
 * VisionCare AI - Risk Assessment Engine
 * Calculates patient health risk based on vitals, ECG and conditions
 */

class RiskAssessmentEngine {
    constructor() {
        this.riskLevels = {
            LOW: 1,
            MODERATE: 2,
            HIGH: 3,
            CRITICAL: 4
        };
    }

    /**
     * Main Risk Evaluation Function
     */
    evaluatePatient(patientData) {
        const {
            age,
            vitals,
            ecgData,
            emergencyFlags
        } = patientData;

        let score = 0;

        score += this.evaluateVitals(vitals);
        score += this.evaluateECG(ecgData);
        score += this.evaluateAge(age);
        score += this.evaluateEmergencyFlags(emergencyFlags);

        const level = this.getRiskLevel(score);

        return {
            score,
            level,
            recommendation: this.getRecommendation(level),
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Evaluate Vital Signs
     */
    evaluateVitals(vitals) {
        if (!vitals) return 0;

        let score = 0;

        const { heartRate, systolicBP, diastolicBP, oxygen, temperature } = vitals;

        // Heart Rate
        if (heartRate < 50 || heartRate > 120) score += 3;
        else if (heartRate < 60 || heartRate > 100) score += 2;

        // Blood Pressure
        if (systolicBP > 180 || diastolicBP > 120) score += 4;
        else if (systolicBP > 140 || diastolicBP > 90) score += 2;

        // Oxygen Saturation
        if (oxygen < 90) score += 4;
        else if (oxygen < 95) score += 2;

        // Temperature
        if (temperature > 39 || temperature < 35) score += 3;
        else if (temperature > 38) score += 1;

        return score;
    }

    /**
     * Evaluate ECG Data
     */
    evaluateECG(ecgData) {
        if (!ecgData) return 0;

        let score = 0;

        const { arrhythmiaDetected, stElevation, irregularRhythm } = ecgData;

        if (arrhythmiaDetected) score += 4;
        if (stElevation) score += 5;
        if (irregularRhythm) score += 3;

        return score;
    }

    /**
     * Age Factor
     */
    evaluateAge(age) {
        if (!age) return 0;

        if (age > 75) return 3;
        if (age > 60) return 2;
        if (age > 45) return 1;

        return 0;
    }

    /**
     * Emergency Flags Override
     */
    evaluateEmergencyFlags(flags) {
        if (!flags) return 0;

        let score = 0;

        if (flags.cardiacArrest) score += 10;
        if (flags.unconscious) score += 5;
        if (flags.respiratoryFailure) score += 8;

        return score;
    }

    /**
     * Convert Score to Risk Level
     */
    getRiskLevel(score) {
        if (score >= 15) return "CRITICAL";
        if (score >= 10) return "HIGH";
        if (score >= 5) return "MODERATE";
        return "LOW";
    }

    /**
     * Generate Recommended Action
     */
    getRecommendation(level) {
        switch (level) {
            case "CRITICAL":
                return "Immediate ICU attention required. Activate emergency protocol.";
            case "HIGH":
                return "Urgent medical review required. Continuous monitoring advised.";
            case "MODERATE":
                return "Monitor closely and re-evaluate in short intervals.";
            case "LOW":
                return "Stable condition. Continue routine monitoring.";
            default:
                return "Unknown risk level.";
        }
    }
}

module.exports = RiskAssessmentEngine;
