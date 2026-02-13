/* ======================================================
   VisionCare AI - Statistics Engine
   Advanced Patient Analytics Module
====================================================== */

import visionCareStore from "./dataStore.js";

class StatisticsEngine {

    constructor() {
        this.analysisHistory = [];
    }

    /* ================= GET HEART RATE HISTORY ================= */

    getHeartRateHistory(patientId) {
        const patient = visionCareStore.getPatient(patientId);
        if (!patient) return [];
        return patient.history.map(entry => entry.value);
    }

    /* ================= CALCULATE AVERAGE ================= */

    calculateAverage(patientId) {
        const data = this.getHeartRateHistory(patientId);
        if (data.length === 0) return 0;

        const sum = data.reduce((a, b) => a + b, 0);
        return Math.round(sum / data.length);
    }

    /* ================= CALCULATE VARIABILITY ================= */

    calculateVariability(patientId) {
        const data = this.getHeartRateHistory(patientId);
        if (data.length < 2) return 0;

        let diffs = [];
        for (let i = 1; i < data.length; i++) {
            diffs.push(Math.abs(data[i] - data[i - 1]));
        }

        const avgDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length;
        return Math.round(avgDiff);
    }

    /* ================= DETECT RAPID SPIKE ================= */

    detectRapidSpike(patientId) {
        const data = this.getHeartRateHistory(patientId);
        if (data.length < 3) return false;

        const last = data[data.length - 1];
        const prev = data[data.length - 2];

        return (last - prev) > 25;
    }

    /* ================= TREND ANALYSIS ================= */

    analyzeTrend(patientId) {
        const data = this.getHeartRateHistory(patientId);
        if (data.length < 5) return "stable";

        const first = data.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
        const last = data.slice(-3).reduce((a, b) => a + b, 0) / 3;

        if (last > first + 15) return "increasing";
        if (last < first - 15) return "decreasing";
        return "stable";
    }

    /* ================= RISK SCORE (0-100) ================= */

    calculateRiskScore(patientId) {

        const patient = visionCareStore.getPatient(patientId);
        if (!patient) return 0;

        let score = 0;

        // Heart rate severity
        if (patient.heartRate > 130) score += 40;
        else if (patient.heartRate > 110) score += 25;
        else if (patient.heartRate > 95) score += 15;

        // Variability
        const variability = this.calculateVariability(patientId);
        if (variability > 20) score += 20;
        else if (variability > 10) score += 10;

        // Spike detection
        if (this.detectRapidSpike(patientId)) score += 20;

        // Trend
        const trend = this.analyzeTrend(patientId);
        if (trend === "increasing") score += 15;

        return Math.min(score, 100);
    }

    /* ================= AI CONFIDENCE SCORE ================= */

    calculateAIConfidence(patientId) {

        const dataLength = this.getHeartRateHistory(patientId).length;

        if (dataLength > 40) return 95;
        if (dataLength > 25) return 85;
        if (dataLength > 10) return 70;
        return 50;
    }

    /* ================= FULL ANALYSIS ================= */

    generateFullAnalysis(patientId) {

        const analysis = {
            patientId,
            averageHR: this.calculateAverage(patientId),
            variability: this.calculateVariability(patientId),
            rapidSpikeDetected: this.detectRapidSpike(patientId),
            trend: this.analyzeTrend(patientId),
            riskScore: this.calculateRiskScore(patientId),
            aiConfidence: this.calculateAIConfidence(patientId),
            timestamp: new Date().toISOString()
        };

        this.analysisHistory.push(analysis);

        console.log("📊 Analysis Generated:", analysis);

        return analysis;
    }

    /* ================= COMPARE TWO PATIENTS ================= */

    comparePatients() {

        const p1 = this.generateFullAnalysis(1);
        const p2 = this.generateFullAnalysis(2);

        return {
            higherRiskPatient: p1.riskScore > p2.riskScore ? 1 : 2,
            patient1Risk: p1.riskScore,
            patient2Risk: p2.riskScore
        };
    }

    /* ================= SYSTEM WIDE HEALTH SCORE ================= */

    calculateSystemHealthScore() {

        const patients = visionCareStore.getAllPatients();
        let totalRisk = 0;
        let count = 0;

        for (let id in patients) {
            totalRisk += this.calculateRiskScore(parseInt(id));
            count++;
        }

        const avgRisk = totalRisk / count;

        return Math.max(100 - avgRisk, 0);
    }

    /* ================= GET ANALYSIS HISTORY ================= */

    getAnalysisHistory() {
        return this.analysisHistory;
    }
}

/* ================= EXPORT INSTANCE ================= */

const statisticsEngine = new StatisticsEngine();
export default statisticsEngine;

