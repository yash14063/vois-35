/**
 * VisionCare AI - SpO2 Engine
 * Calculates Oxygen Saturation (SpO2) using IR and Red LED signals
 */

class SpO2Engine {
    constructor() {
        this.calibrationFactor = 110;   // Standard calibration constant
        this.minSpO2 = 70;
        this.maxSpO2 = 100;
    }

    /**
     * Main SpO2 Calculation Function
     * @param {Array} irSignal - Infrared signal readings
     * @param {Array} redSignal - Red light signal readings
     */
    calculateSpO2(irSignal, redSignal) {
        if (!irSignal || !redSignal || irSignal.length !== redSignal.length) {
            throw new Error("Invalid sensor data");
        }

        const filteredIR = this.lowPassFilter(irSignal);
        const filteredRed = this.lowPassFilter(redSignal);

        const ratio = this.computeRatio(filteredIR, filteredRed);
        let spo2 = this.calibrationFactor - (25 * ratio);

        spo2 = Math.max(this.minSpO2, Math.min(this.maxSpO2, spo2));

        return {
            spo2: parseFloat(spo2.toFixed(2)),
            status: this.getSpO2Status(spo2),
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Simple Low-Pass Filter
     */
    lowPassFilter(signal) {
        const alpha = 0.2;
        let filtered = [signal[0]];

        for (let i = 1; i < signal.length; i++) {
            filtered[i] = alpha * signal[i] + (1 - alpha) * filtered[i - 1];
        }

        return filtered;
    }

    /**
     * Compute Ratio-of-Ratios
     */
    computeRatio(irSignal, redSignal) {
        const irAC = this.computeAC(irSignal);
        const irDC = this.computeDC(irSignal);

        const redAC = this.computeAC(redSignal);
        const redDC = this.computeDC(redSignal);

        if (irDC === 0 || redDC === 0) return 0;

        const ratio = (redAC / redDC) / (irAC / irDC);
        return ratio;
    }

    /**
     * AC Component (peak-to-peak amplitude)
     */
    computeAC(signal) {
        const max = Math.max(...signal);
        const min = Math.min(...signal);
        return max - min;
    }

    /**
     * DC Component (mean value)
     */
    computeDC(signal) {
        const sum = signal.reduce((a, b) => a + b, 0);
        return sum / signal.length;
    }

    /**
     * SpO2 Status Classification
     */
    getSpO2Status(spo2) {
        if (spo2 >= 95) return "NORMAL";
        if (spo2 >= 90) return "MILD HYPOXIA";
        if (spo2 >= 85) return "MODERATE HYPOXIA";
        return "SEVERE HYPOXIA";
    }
}

module.exports = SpO2Engine;

