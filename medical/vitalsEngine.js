/**
 * VisionCare AI - Vital Engine
 * Processes and evaluates patient vital signs
 */

class VitalEngine {
    constructor() {
        this.normalRanges = {
            heartRate: { min: 60, max: 100 },
            systolicBP: { min: 90, max: 120 },
            diastolicBP: { min: 60, max: 80 },
            temperature: { min: 36.5, max: 37.5 },
            respiratoryRate: { min: 12, max: 20 },
            spo2: { min: 95, max: 100 }
        };
    }

    /**
     * Main evaluation function
     */
    evaluateVitals(vitals) {
        if (!vitals) {
            throw new Error("Vitals data missing");
        }

        const analysis = {
            heartRate: this.checkRange("heartRate", vitals.heartRate),
            bloodPressure: this.checkBloodPressure(
                vitals.systolicBP,
                vitals.diastolicBP
            ),
            temperature: this.checkRange("temperature", vitals.temperature),
            respiratoryRate: this.checkRange("respiratoryRate", vitals.respiratoryRate),
            spo2: this.checkRange("spo2", vitals.spo2)
        };

        const stabilityScore = this.calculateStabilityScore(analysis);

        return {
            vitals,
            analysis,
            stabilityScore,
            condition: this.getCondition(stabilityScore),
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Generic Range Checker
     */
    checkRange(type, value) {
        const range = this.normalRanges[type];
        if (!range || value == null) return "UNKNOWN";

        if (value < range.min) return "LOW";
        if (value > range.max) return "HIGH";
        return "NORMAL";
    }

    /**
     * Blood Pressure Specific Logic
     */
    checkBloodPressure(systolic, diastolic) {
        if (!systolic || !diastolic) return "UNKNOWN";

        if (systolic > 180 || diastolic > 120) return "HYPERTENSIVE CRISIS";
        if (systolic > 140 || diastolic > 90) return "HIGH";
        if (systolic < 90 || diastolic < 60) return "LOW";
        return "NORMAL";
    }

    /**
     * Stability Score Calculation
     */
    calculateStabilityScore(analysis) {
        let score = 100;

        Object.values(analysis).forEach(status => {
            if (status === "HIGH" || status === "LOW") score -= 10;
            if (status === "HYPERTENSIVE CRISIS") score -= 25;
        });

        return Math.max(score, 0);
    }

    /**
     * Overall Condition Based on Stability Score
     */
    getCondition(score) {
        if (score >= 85) return "STABLE";
        if (score >= 65) return "MONITOR";
        if (score >= 40) return "UNSTABLE";
        return "CRITICAL";
    }
}

module.exports = VitalEngine;

