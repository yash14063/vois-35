/* ===========================================
   VisionCare AI - Notification Service
   notificationService.js
   =========================================== */

class NotificationService {

    constructor() {
        this.history = [];
        this.permissionGranted = false;
        this.pushEnabled = false;
    }

    /* ===========================================
       REQUEST BROWSER PERMISSION
    =========================================== */
    async requestPermission() {

        if (!("Notification" in window)) {
            console.warn("Browser does not support notifications.");
            return;
        }

        const permission = await Notification.requestPermission();

        if (permission === "granted") {
            this.permissionGranted = true;
            console.log("✅ Notification Permission Granted");
        } else {
            console.warn("❌ Notification Permission Denied");
        }
    }

    /* ===========================================
       SEND IN-APP NOTIFICATION
    =========================================== */
    sendInAppNotification({ title, message, type = "info" }) {

        const notification = {
            id: Date.now(),
            title,
            message,
            type,
            timestamp: new Date().toISOString()
        };

        this.history.push(notification);

        this.renderNotification(notification);

        console.log("📢 In-App Notification:", notification);
    }

    /* ===========================================
       SEND BROWSER PUSH NOTIFICATION
    =========================================== */
    sendPushNotification({ title, message }) {

        if (!this.permissionGranted) return;

        const push = new Notification(title, {
            body: message,
            icon: "/assets/medical-icon.png"
        });

        push.onclick = () => {
            window.focus();
        };

        this.history.push({
            title,
            message,
            type: "push",
            timestamp: new Date().toISOString()
        });

        console.log("📲 Push Notification Sent");
    }

    /* ===========================================
       EMAIL NOTIFICATION (API READY)
       (Requires backend endpoint)
    =========================================== */
    async sendEmailNotification(data) {

        try {
            const response = await fetch("/api/send-email", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            console.log("📧 Email Notification Triggered");
            return response.json();

        } catch (error) {
            console.error("Email Notification Failed:", error);
        }
    }

    /* ===========================================
       RENDER UI NOTIFICATION
    =========================================== */
    renderNotification(notification) {

        const container = document.getElementById("notificationContainer");
        if (!container) return;

        const div = document.createElement("div");
        div.className = `notification-card ${notification.type}`;
        div.id = `notification-${notification.id}`;

        div.innerHTML = `
            <h4>${notification.title}</h4>
            <p>${notification.message}</p>
            <small>${new Date(notification.timestamp).toLocaleTimeString()}</small>
        `;

        container.appendChild(div);

        setTimeout(() => {
            div.remove();
        }, 5000);
    }

    /* ===========================================
       CONNECT WITH ALERT SYSTEM
    =========================================== */
    connectToAlertManager(alertManager) {

        const originalTrigger = alertManager.triggerAlert.bind(alertManager);

        alertManager.triggerAlert = (data) => {

            originalTrigger(data);

            this.sendInAppNotification({
                title: data.type.replace("_", " "),
                message: data.message,
                type: data.severity
            });

            if (data.severity === "critical") {
                this.sendPushNotification({
                    title: "🚨 Critical Emergency",
                    message: data.message
                });
            }
        };
    }

    /* ===========================================
       GET NOTIFICATION HISTORY
    =========================================== */
    getHistory() {
        return this.history;
    }

    /* ===========================================
       CLEAR HISTORY
    =========================================== */
    clearHistory() {
        this.history = [];
    }
}

export default NotificationService;

