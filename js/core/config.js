/* ===========================================
   VisionCare AI - Global Configuration
   config.js
   =========================================== */

const CONFIG = {

    /* ===========================================
       ENVIRONMENT SETTINGS
    =========================================== */
    ENV: {
        MODE: "development", // development | production
        VERSION: "1.0.0",
        DEBUG: true
    },

    /* ===========================================
       CAMERA CONFIGURATION
    =========================================== */
    CAMERA: {
        WIDTH: 640,
        HEIGHT: 480,
        FRAME_RATE: 30,
        FACING_MODE: "user", // user | environment
        AUTO_START: false
    },

    /* ===========================================
       PATIENT DETECTION SETTINGS
    =========================================== */
    PATIENT_DETECTION: {
        MAX_PATIENTS: 2,
        CONFIDENCE_THRESHOLD: 0.6,
        TRACKING_ENABLED: true,
        MISSING_TIMEOUT: 3000, // ms
        DRAW_BOUNDING_BOX: true,
        BOX_COLOR: "#00FFAA"
    },

    /* ===========================================
       GESTURE RECOGNITION SETTINGS
    =========================================== */
    GESTURE_RECOGNITION: {
        ENABLED: true,
        MAX_HANDS: 4, // 2 patients x 2 hands
        DETECTION_CONFIDENCE: 0.6,
        TRACKING_CONFIDENCE: 0.6,
        EMERGENCY_GESTURE_NAME: "Emergency Help"
    },

    /* ===========================================
       EMERGENCY SYSTEM SETTINGS
    =========================================== */
    EMERGENCY: {
        ESCALATION_DELAY: 10000, // 10 sec
        AUTO_RESOLVE: false,
        LOG_HISTORY_LIMIT: 100,

        VITAL_THRESHOLDS: {
            HEART_RATE_MIN: 40,
            HEART_RATE_MAX: 130,
            OXYGEN_MIN: 85
        }
    },

    /* ===========================================
       ALERT MANAGER SETTINGS
    =========================================== */
    ALERTS: {
        AUTO_DISMISS_TIME: 5000,
        SOUND_ENABLED: true,
        MAX_ACTIVE_ALERTS: 5,
        PRIORITY_LEVELS: ["low", "medium", "high", "critical"]
    },

    /* ===========================================
       NOTIFICATION SERVICE SETTINGS
    =========================================== */
    NOTIFICATIONS: {
        ENABLE_PUSH: true,
        ENABLE_EMAIL: false,
        AUTO_REQUEST_PERMISSION: true,
        ICON_PATH: "/assets/medical-icon.png"
    },

    /* ===========================================
       UI SETTINGS
    =========================================== */
    UI: {
        THEME: "medical-dark",
        ANIMATION_ENABLED: true,
        SHOW_PATIENT_PANEL: true,
        SHOW_GESTURE_PANEL: true,
        SHOW_ALERT_PANEL: true,
        SHOW_NOTIFICATION_PANEL: true
    },

    /* ===========================================
       FEATURE TOGGLES
    =========================================== */
    FEATURES: {
        ENABLE_VITAL_MONITORING: true,
        ENABLE_AI_RISK_SCORING: false,
        ENABLE_ANALYTICS: false,
        ENABLE_MULTI_ROOM_SUPPORT: false,
        ENABLE_BLOCKCHAIN_LOGGING: false
    },

    /* ===========================================
       API ENDPOINTS (For Future Backend)
    =========================================== */
    API: {
        BASE_URL: "/api",
        SEND_EMAIL: "/send-email",
        SAVE_LOG: "/save-log",
        GET_ANALYTICS: "/analytics"
    },

    /* ===========================================
       PERFORMANCE SETTINGS
    =========================================== */
    PERFORMANCE: {
        USE_TFJS_BACKEND: "webgl", // webgl | cpu
        DETECTION_INTERVAL: 100, // ms
        MEMORY_CLEANUP_INTERVAL: 30000
    }
};

/* ===========================================
   FREEZE CONFIG TO PREVENT MODIFICATION
=========================================== */

Object.freeze(CONFIG);
Object.freeze(CONFIG.ENV);
Object.freeze(CONFIG.CAMERA);
Object.freeze(CONFIG.PATIENT_DETECTION);
Object.freeze(CONFIG.GESTURE_RECOGNITION);
Object.freeze(CONFIG.EMERGENCY);
Object.freeze(CONFIG.ALERTS);
Object.freeze(CONFIG.NOTIFICATIONS);
Object.freeze(CONFIG.UI);
Object.freeze(CONFIG.FEATURES);
Object.freeze(CONFIG.API);
Object.freeze(CONFIG.PERFORMANCE);

export default CONFIG;

