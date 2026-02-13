/* ===========================================
   VisionCare AI - ECG Engine
   ecgEngine.js
   =========================================== */

import CONFIG from './config.js';

class ECGEngine {

    constructor(canvasElement, emergencySystem = null) {
        this.canvas = canvasElement;
        this.ctx = this.canvas.getContext("2d");

        this.width = this.canvas.width;
        this.height = this.canvas.height;

        this.running = false;
        this.animationId = null;

        this.heartRate = 75;
        this.oxygen = 98;

        this.ecgData = [];
        this.maxDataPoints = 500;

        this.emergencySystem = emergencySystem;

        this.lastBeatTime = Date.now();
    }

    /* ===========================================
       START ECG MONITORING
    =========================================== */
    start() {
        this.running = true;
        this.generateECG();
        console.log("📈 ECG Monitoring Started");
    }

    /* ===========================================
       STOP ECG
    =========================================== */
    stop() {
        this.running = false;
        cancelAnimationFrame(this.animationId);
        console.log("🛑 ECG Monitoring Stopped");
    }

    /* ===========================================
       SIMULATE ECG SIGNAL
    =========================================== */
    generateECG() {

        const loop = () => {

            if (!this.running) return;

            const now = Date.now();
            const interval = 60000 / this.heartRate;

            let value = 0;

            if (now - this.lastBeatTime >= interval) {
                value = this.createHeartbeatSpike();
                this.lastBeatTime = now;
            } else {
                value = Math.random() * 0.1 - 0.05;
            }

            this.ecgData.push(value);

            if (this.ecgData.length > this.maxDataPoints) {
                this.ecgData.shift();
            }

            this.drawECG();
            this.detectAnomaly();

            this.animationId = requestAnimationFrame(loop);
        };

        loop();
    }

    /* ===========================================
       CREATE ECG SPIKE
    =========================================== */
    createHeartbeatSpike() {

        const spikePattern = [0, 0.2, 0.8, -0.4, 0.1, 0];
        spikePattern.forEach(v => {
            this.ecgData.push(v);
        });

        return 0;
    }

    /* ===========================================
       DRAW ECG GRAPH
    =========================================== */
    drawECG() {

        this.ctx.clearRect(0, 0, this.width, this.height);

        this.ctx.beginPath();
        this.ctx.strokeStyle = "#00FFAA";
        this.ctx.lineWidth = 2;

        const sliceWidth = this.width / this.maxDataPoints;
        let x = 0;

        for (let i = 0; i < this.ecgData.length; i++) {

            const y = this.height / 2 - this.ecgData[i] * 100;

            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }

            x += sliceWidth;
        }

        this.ctx.stroke();

        this.drawVitalsText();
    }

    /* ===========================================
       DRAW VITAL TEXT
    =========================================== */
    drawVitalsText() {

        this.ctx.fillStyle = "#ffffff";
        this.ctx.font = "16px Arial";

        this.ctx.fillText(
            `Heart Rate: ${this.heartRate} bpm`,
            10,
            20
        );

        this.ctx.fillText(
            `Oxygen: ${this.oxygen}%`,
            10,
            40
        );
    }

    /* ===========================================
       DETECT ANOMALY
    =========================================== */
    detectAnomaly() {

        const thresholds = CONFIG.EMERGENCY.VITAL_THRESHOLDS;

        if (this.heartRate > thresholds.HEART_RATE_MAX ||
            this.heartRate < thresholds.HEART_RATE_MIN) {

            if (this.emergencySystem) {
                this.emergencySystem.triggerEmergency({
                    type: "HEART_RATE_ANOMALY",
                    severity: "critical",
                    message: `Abnormal heart rate: ${this.heartRate} bpm`
                });
            }
        }

        if (this.oxygen < thresholds.OXYGEN_MIN) {

            if (this.emergencySystem) {
                this.emergencySystem.triggerEmergency({
                    type: "LOW_OXYGEN",
                    severity: "critical",
                    message: `Critical oxygen level: ${this.oxygen}%`
                });
            }
        }
    }

    /* ===========================================
       UPDATE HEART RATE (Simulated Input)
    =========================================== */
    setHeartRate(rate) {
        this.heartRate = rate;
    }

    /* ===========================================
       UPDATE OXYGEN LEVEL
    =========================================== */
    setOxygenLevel(level) {
        this.oxygen = level;
    }

    /* ===========================================
       RANDOM EMERGENCY TEST
    =========================================== */
    simulateEmergency() {
        this.setHeartRate(160);
        this.setOxygenLevel(80);
    }

    /* ===========================================
       GET CURRENT VITALS
    =========================================== */
    getVitals() {
        return {
            heartRate: this.heartRate,
            oxygen: this.oxygen
        };
    }
}

export default ECGEngine;

