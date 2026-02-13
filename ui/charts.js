/**
 * VisionCare AI - Real-Time Vital Chart Engine
 * Requires Chart.js library
 */

class VitalChartEngine {
    constructor(canvasId) {
        this.ctx = document.getElementById(canvasId).getContext('2d');
        this.maxDataPoints = 30;

        this.chart = new Chart(this.ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    this.createDataset("Heart Rate", "rgb(255, 99, 132)"),
                    this.createDataset("SpO2", "rgb(54, 162, 235)"),
                    this.createDataset("Temperature", "rgb(255, 159, 64)")
                ]
            },
            options: {
                responsive: true,
                animation: {
                    duration: 500
                },
                scales: {
                    y: {
                        beginAtZero: false
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: "#ffffff"
                        }
                    }
                }
            }
        });
    }

    /**
     * Create Dataset Template
     */
    createDataset(label, color) {
        return {
            label: label,
            data: [],
            borderColor: color,
            backgroundColor: color,
            tension: 0.4,
            borderWidth: 2,
            fill: false
        };
    }

    /**
     * Add New Data Point
     */
    updateChart(vitals) {
        const time = new Date().toLocaleTimeString();

        if (this.chart.data.labels.length >= this.maxDataPoints) {
            this.chart.data.labels.shift();
            this.chart.data.datasets.forEach(ds => ds.data.shift());
        }

        this.chart.data.labels.push(time);

        this.chart.data.datasets[0].data.push(vitals.heartRate || null);
        this.chart.data.datasets[1].data.push(vitals.spo2 || null);
        this.chart.data.datasets[2].data.push(vitals.temperature || null);

        this.chart.update();
    }

    /**
     * Reset Chart
     */
    resetChart() {
        this.chart.data.labels = [];
        this.chart.data.datasets.forEach(ds => ds.data = []);
        this.chart.update();
    }
}

// Export if using modules
if (typeof module !== "undefined") {
    module.exports = VitalChartEngine;
}

