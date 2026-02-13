/* ===========================================
   VisionCare AI - Dual Patient Detection Core
   patientDetection.js
   =========================================== */

import * as blazeface from "https://cdn.jsdelivr.net/npm/@tensorflow-models/blazeface";
import * as tf from "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.16.0/dist/tf.min.js";

class PatientDetectionEngine {

    constructor(videoElement, canvasElement) {
        this.video = videoElement;
        this.canvas = canvasElement;
        this.ctx = this.canvas.getContext("2d");

        this.model = null;
        this.maxPatients = 2;
        this.trackedPatients = [];
        this.previousDetections = [];
        this.alertCallback = null;
        this.animationId = null;
    }

    /* ===========================================
       LOAD MODEL
    =========================================== */
    async loadModel() {
        await tf.ready();
        this.model = await blazeface.load();
        console.log("✅ BlazeFace Model Loaded");
    }

    /* ===========================================
       START DETECTION LOOP
    =========================================== */
    async start() {

        if (!this.model) {
            console.error("❌ Model not loaded");
            return;
        }

        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;

        const detectLoop = async () => {

            const predictions = await this.model.estimateFaces(
                this.video,
                false
            );

            this.processDetections(predictions);
            this.animationId = requestAnimationFrame(detectLoop);
        };

        detectLoop();
    }

    /* ===========================================
       PROCESS DETECTIONS
    =========================================== */
    processDetections(predictions) {

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.trackedPatients = [];

        predictions.slice(0, this.maxPatients).forEach((prediction, index) => {

            const start = prediction.topLeft;
            const end = prediction.bottomRight;
            const width = end[0] - start[0];
            const height = end[1] - start[1];

            const patient = {
                id: index + 1,
                x: start[0],
                y: start[1],
                width: width,
                height: height,
                confidence: prediction.probability[0].toFixed(2),
                lastSeen: Date.now()
            };

            this.trackedPatients.push(patient);
            this.drawPatientBox(patient);
        });

        this.checkMissingPatients();
        this.updateUI();
    }

    /* ===========================================
       DRAW BOX
    =========================================== */
    drawPatientBox(patient) {

        this.ctx.strokeStyle = "#00FFAA";
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(
            patient.x,
            patient.y,
            patient.width,
            patient.height
        );

        this.ctx.fillStyle = "#00FFAA";
        this.ctx.font = "16px Arial";
        this.ctx.fillText(
            `Patient ${patient.id} (${patient.confidence})`,
            patient.x,
            patient.y - 10
        );
    }

    /* ===========================================
       CHECK IF PATIENT DISAPPEARS
    =========================================== */
    checkMissingPatients() {

        if (this.trackedPatients.length < this.maxPatients) {

            if (this.alertCallback) {
                this.alertCallback({
                    type: "PATIENT_MISSING",
                    timestamp: new Date().toISOString()
                });
            }

            console.warn("⚠ Patient Missing Detected");
        }
    }

    /* ===========================================
       UPDATE UI PANEL
    =========================================== */
    updateUI() {

        const panel = document.getElementById("patientPanel");
        if (!panel) return;

        panel.innerHTML = "";

        this.trackedPatients.forEach(patient => {

            const card = document.createElement("div");
            card.className = "patient-card";

            card.innerHTML = `
                <h3>Patient ${patient.id}</h3>
                <p>Confidence: ${patient.confidence}</p>
                <p>Position: (${Math.round(patient.x)}, ${Math.round(patient.y)})</p>
            `;

            panel.appendChild(card);
        });
    }

    /* ===========================================
       SET ALERT CALLBACK
    =========================================== */
    onAlert(callback) {
        this.alertCallback = callback;
    }

    /* ===========================================
       STOP DETECTION
    =========================================== */
    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        console.log("🛑 Detection Stopped");
    }

    /* ===========================================
       GET PATIENT DATA
    =========================================== */
    getPatientData() {
        return this.trackedPatients;
    }
}

export default PatientDetectionEngine;

