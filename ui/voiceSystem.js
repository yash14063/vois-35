/**
 * VisionCare AI - Voice System
 * Handles speech recognition + text-to-speech + medical commands
 * Uses Web Speech API
 */

class VoiceSystem {
    constructor(config = {}) {
        this.language = config.language || "en-US";
        this.emergencyCallback = config.onEmergency || null;
        this.commandCallback = config.onCommand || null;

        this.isListening = false;
        this.recognition = null;

        this.initRecognition();
    }

    /**
     * Initialize Speech Recognition
     */
    initRecognition() {
        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            console.error("Speech Recognition not supported in this browser.");
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.lang = this.language;
        this.recognition.continuous = true;
        this.recognition.interimResults = false;

        this.recognition.onresult = (event) => {
            const transcript =
                event.results[event.results.length - 1][0].transcript.toLowerCase();

            console.log("Voice Input:", transcript);
            this.handleCommand(transcript);
        };

        this.recognition.onerror = (event) => {
            console.error("Voice recognition error:", event.error);
        };

        this.recognition.onend = () => {
            if (this.isListening) {
                this.recognition.start(); // Auto restart
            }
        };
    }

    /**
     * Start Listening
     */
    startListening() {
        if (!this.recognition) return;

        this.isListening = true;
        this.recognition.start();
        console.log("Voice System Activated");
    }

    /**
     * Stop Listening
     */
    stopListening() {
        if (!this.recognition) return;

        this.isListening = false;
        this.recognition.stop();
        console.log("Voice System Stopped");
    }

    /**
     * Speak Message
     */
    speak(message, priority = "normal") {
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = this.language;

        if (priority === "emergency") {
            utterance.rate = 1.1;
            utterance.pitch = 1.2;
            utterance.volume = 1;
        } else {
            utterance.rate = 1;
            utterance.pitch = 1;
            utterance.volume = 0.9;
        }

        window.speechSynthesis.speak(utterance);
    }

    /**
     * Handle Recognized Commands
     */
    handleCommand(transcript) {
        // Emergency keywords
        const emergencyKeywords = [
            "code blue",
            "emergency",
            "patient unconscious",
            "cardiac arrest",
            "help immediately"
        ];

        if (emergencyKeywords.some(keyword => transcript.includes(keyword))) {
            this.triggerEmergency(transcript);
            return;
        }

        // Check vitals command
        if (transcript.includes("show vitals")) {
            this.speak("Displaying current patient vitals.");
            if (this.commandCallback) {
                this.commandCallback({ type: "SHOW_VITALS" });
            }
            return;
        }

        // Risk level query
        if (transcript.includes("risk level")) {
            this.speak("Fetching current patient risk level.");
            if (this.commandCallback) {
                this.commandCallback({ type: "SHOW_RISK" });
            }
            return;
        }

        // General command callback
        if (this.commandCallback) {
            this.commandCallback({ type: "GENERAL", text: transcript });
        }
    }

    /**
     * Emergency Trigger
     */
    triggerEmergency(transcript) {
        console.warn("🚨 Emergency Detected via Voice:", transcript);

        this.speak("Emergency protocol activated. Alerting medical team.", "emergency");

        if (this.emergencyCallback) {
            this.emergencyCallback({
                source: "VOICE",
                message: transcript,
                timestamp: new Date().toISOString()
            });
        }
    }
}

// Export for module usage
if (typeof module !== "undefined") {
    module.exports = VoiceSystem;
}

