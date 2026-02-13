/* ======================================================
   VisionCare AI - Medical Report Generator
   Generates Patient Reports (PDF + JSON + Print)
====================================================== */

import visionCareStore from "./dataStore.js";

class ReportGenerator {

    constructor() {
        this.hospitalName = "VisionCare AI Medical Center";
        this.generatedReports = [];
    }

    /* ================= GENERATE FULL REPORT ================= */

    generatePatientReport(patientId) {

        const patient = visionCareStore.getPatient(patientId);
        if (!patient) return null;

        const report = {
            hospital: this.hospitalName,
            patientId: patient.id,
            heartRate: patient.heartRate,
            spo2: patient.spo2,
            riskLevel: patient.riskLevel,
            history: patient.history,
            lastUpdated: patient.lastUpdated,
            emergencyActive: visionCareStore.emergencyActive,
            logs: visionCareStore.getLogs().slice(-10),
            generatedAt: new Date().toISOString()
        };

        this.generatedReports.push(report);

        console.log("📄 Report Generated for Patient", patientId);

        return report;
    }

    /* ================= GENERATE SUMMARY REPORT ================= */

    generateSystemSummary() {

        const patients = visionCareStore.getAllPatients();

        return {
            hospital: this.hospitalName,
            totalPatients: Object.keys(patients).length,
            riskSummary: visionCareStore.getRiskSummary(),
            emergencyActive: visionCareStore.emergencyActive,
            generatedAt: new Date().toISOString()
        };
    }

    /* ================= EXPORT JSON ================= */

    exportJSON(patientId) {

        const report = this.generatePatientReport(patientId);
        if (!report) return;

        const blob = new Blob([JSON.stringify(report, null, 2)], {
            type: "application/json"
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Patient_${patientId}_Report.json`;
        a.click();

        URL.revokeObjectURL(url);
    }

    /* ================= PRINT REPORT ================= */

    printReport(patientId) {

        const report = this.generatePatientReport(patientId);
        if (!report) return;

        const reportWindow = window.open("", "_blank");

        reportWindow.document.write(`
            <html>
            <head>
                <title>Patient ${patientId} Report</title>
                <style>
                    body { font-family: Arial; padding: 30px; }
                    h1 { color: #1976d2; }
                    table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                    th, td { border: 1px solid #ccc; padding: 8px; }
                    th { background: #f5f5f5; }
                </style>
            </head>
            <body>
                <h1>${this.hospitalName}</h1>
                <h2>Patient ${patientId} Medical Report</h2>

                <p><strong>Heart Rate:</strong> ${report.heartRate} bpm</p>
                <p><strong>SpO2:</strong> ${report.spo2}%</p>
                <p><strong>Risk Level:</strong> ${report.riskLevel}</p>
                <p><strong>Last Updated:</strong> ${report.lastUpdated}</p>
                <p><strong>Emergency Active:</strong> ${report.emergencyActive}</p>

                <h3>Heart Rate History</h3>
                <table>
                    <tr>
                        <th>Time</th>
                        <th>HR</th>
                    </tr>
                    ${report.history.map(entry => `
                        <tr>
                            <td>${new Date(entry.timestamp).toLocaleTimeString()}</td>
                            <td>${entry.value}</td>
                        </tr>
                    `).join("")}
                </table>

                <h3>Recent System Logs</h3>
                <ul>
                    ${report.logs.map(log => `
                        <li>${log.timestamp} - ${log.message}</li>
                    `).join("")}
                </ul>

            </body>
            </html>
        `);

        reportWindow.document.close();
        reportWindow.print();
    }

    /* ================= SIMULATED PDF DOWNLOAD ================= */

    downloadPDF(patientId) {

        /*
         This uses browser print-to-PDF.
         For real backend PDF:
         Use jsPDF or server-side Node PDF engine.
        */

        this.printReport(patientId);
    }

    /* ================= EMERGENCY REPORT ================= */

    generateEmergencyReport() {

        if (!visionCareStore.emergencyActive) {
            console.log("No emergency currently active.");
            return null;
        }

        return {
            hospital: this.hospitalName,
            emergency: true,
            patients: visionCareStore.getRiskSummary(),
            logs: visionCareStore.getLogs().slice(-20),
            generatedAt: new Date().toISOString()
        };
    }

    /* ================= GET GENERATED REPORTS ================= */

    getAllGeneratedReports() {
        return this.generatedReports;
    }
}

/* ================= EXPORT INSTANCE ================= */

const reportGenerator = new ReportGenerator();
export default reportGenerator;

