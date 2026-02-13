/**
 * VisionCare AI - Patient Card Component
 * Handles dynamic patient card creation & updates
 */

class PatientCard {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.cards = new Map();
    }

    /**
     * Create New Patient Card
     */
    createCard(patient) {
        const card = document.createElement("div");
        card.className = "patient-card";
        card.id = `patient-${patient.id}`;

        card.innerHTML = `
            <div class="patient-header">
                <h3>${patient.name}</h3>
                <span class="patient-age">Age: ${patient.age}</span>
            </div>
            <div class="patient-vitals">
                <p>HR: <span class="hr">--</span> bpm</p>
                <p>SpO₂: <span class="spo2">--</span> %</p>
                <p>BP: <span class="bp">-- / --</span></p>
                <p>Temp: <span class="temp">--</span> °C</p>
            </div>
            <div class="patient-risk">
                <span class="risk-badge low">LOW</span>
            </div>
        `;

        card.addEventListener("click", () => {
            this.selectCard(patient.id);
        });

        this.container.appendChild(card);
        this.cards.set(patient.id, card);
    }

    /**
     * Update Patient Data in Card
     */
    updateCard(patientId, vitals, riskLevel) {
        const card = this.cards.get(patientId);
        if (!card) return;

        card.querySelector(".hr").textContent = vitals.heartRate || "--";
        card.querySelector(".spo2").textContent = vitals.spo2 || "--";
        card.querySelector(".bp").textContent =
            `${vitals.systolicBP || "--"} / ${vitals.diastolicBP || "--"}`;
        card.querySelector(".temp").textContent = vitals.temperature || "--";

        const badge = card.querySelector(".risk-badge");
        badge.textContent = riskLevel;
        badge.className = `risk-badge ${riskLevel.toLowerCase()}`;

        this.applyVisualStatus(card, riskLevel);
    }

    /**
     * Highlight Selected Patient
     */
    selectCard(patientId) {
        this.cards.forEach(card => card.classList.remove("active"));

        const selected = this.cards.get(patientId);
        if (selected) {
            selected.classList.add("active");
        }
    }

    /**
     * Apply Risk Color Styling
     */
    applyVisualStatus(card, riskLevel) {
        card.classList.remove("low", "moderate", "high", "critical");
        card.classList.add(riskLevel.toLowerCase());
    }

    /**
     * Remove Patient Card
     */
    removeCard(patientId) {
        const card = this.cards.get(patientId);
        if (card) {
            card.remove();
            this.cards.delete(patientId);
        }
    }

    /**
     * Clear All Cards
     */
    clearAll() {
        this.container.innerHTML = "";
        this.cards.clear();
    }
}

// Export for module usage
if (typeof module !== "undefined") {
    module.exports = PatientCard;
}

