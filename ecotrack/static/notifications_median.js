// Median OneSignal notification integration for Android/iOS app
// This handles notifications when the webapp is running inside the Median-converted app

class MedianNotificationManager {
  constructor() {
    this.isMedianApp = this.detectMedianApp();
    this.oneSignalPlayerId = null;

    // UI elements
    this.toggle = null;
    this.timeInput = null;
    this.testBtn = null;
    this.saveBtn = null;
    this.statusDiv = null;
    this.timeSettingDiv = null;
    this.permissionBtn = null;

    this.init();
  }

  detectMedianApp() {
    // Check if we're running in a Median-wrapped app
    return (
      navigator.userAgent.toLowerCase().includes("median") ||
      window.median !== undefined ||
      window.gonative !== undefined
    );
  }

  async init() {
    console.log("Median NotificationManager initializing...");
    console.log("Detected Median app:", this.isMedianApp);

    this.initializeElements();
    await this.loadNotificationSettings();

    if (this.isMedianApp) {
      await this.setupMedianIntegration();
    } else {
      this.showStatus(
        "This app is optimized for the native mobile app. Please download it from the app store.",
        "warning"
      );
    }

    this.setupEventListeners();
  }

  initializeElements() {
    this.toggle = document.getElementById("notification-toggle");
    this.timeInput = document.getElementById("notification-time");
    this.testBtn = document.getElementById("test-notification-btn");
    this.saveBtn = document.getElementById("save-notification-settings");
    this.statusDiv = document.getElementById("notification-status");
    this.timeSettingDiv = document.getElementById("time-setting");
    this.permissionBtn = document.getElementById("request-permission-btn");
  }

  async setupMedianIntegration() {
    // Wait for Median JavaScript Bridge to be available
    await this.waitForMedianBridge();

    // Get OneSignal info
    try {
      await this.getOneSignalInfo();
      this.showStatus("Native notifications are ready!", "success");
      this.updateUIVisibility(true);
    } catch (error) {
      console.error("Failed to setup OneSignal:", error);
      this.showStatus(
        "Failed to setup native notifications. Please ensure notifications are enabled in your device settings.",
        "error"
      );
    }
  }

  waitForMedianBridge() {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 50; // 5 seconds max wait

      const checkBridge = () => {
        attempts++;

        if (window.median && window.median.onesignal) {
          resolve();
        } else if (attempts >= maxAttempts) {
          reject(new Error("Median bridge not available after 5 seconds"));
        } else {
          setTimeout(checkBridge, 100);
        }
      };

      checkBridge();
    });
  }

  async getOneSignalInfo() {
    return new Promise((resolve, reject) => {
      try {
        // Method 1: Try promise-based approach
        if (
          window.median &&
          window.median.onesignal &&
          window.median.onesignal.info
        ) {
          window.median.onesignal
            .info()
            .then((oneSignalInfo) => {
              this.handleOneSignalInfo(oneSignalInfo);
              resolve();
            })
            .catch(reject);
        } else {
          // Method 2: Try callback approach
          window.median_onesignal_info = (oneSignalInfo) => {
            this.handleOneSignalInfo(oneSignalInfo);
            resolve();
          };

          // Trigger manual call if available
          if (
            window.median &&
            window.median.onesignal &&
            window.median.onesignal.info
          ) {
            window.median.onesignal.info({ callback: "median_onesignal_info" });
          } else {
            setTimeout(
              () => reject(new Error("OneSignal info not available")),
              3000
            );
          }
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  handleOneSignalInfo(oneSignalInfo) {
    console.log("OneSignal Info:", oneSignalInfo);

    if (oneSignalInfo && oneSignalInfo.oneSignalId) {
      this.oneSignalPlayerId = oneSignalInfo.oneSignalId;
      console.log("OneSignal Player ID:", this.oneSignalPlayerId);
    } else if (
      oneSignalInfo &&
      oneSignalInfo.subscription &&
      oneSignalInfo.subscription.id
    ) {
      this.oneSignalPlayerId = oneSignalInfo.subscription.id;
      console.log("OneSignal Player ID (v5):", this.oneSignalPlayerId);
    }
  }

  async loadNotificationSettings() {
    try {
      const response = await fetch("/api/notifications/settings");
      const data = await response.json();

      if (data.status === "success") {
        if (this.toggle) {
          this.toggle.checked = data.data.isSubscribed;
        }

        if (this.timeInput) {
          this.timeInput.value = data.data.notificationTime;
        }

        this.updateUIVisibility(data.data.isSubscribed);

        if (data.data.isSubscribed) {
          this.showStatus("Native notifications are enabled.", "success");
        } else {
          this.showStatus(
            "Enable native notifications to receive daily reminders.",
            "warning"
          );
        }
      } else {
        this.showStatus("Failed to load notification settings.", "error");
      }
    } catch (error) {
      console.error("Error loading notification settings:", error);
      this.showStatus("Error loading notification settings.", "error");
    }
  }

  setupEventListeners() {
    if (this.toggle) {
      this.toggle.addEventListener("change", async (e) => {
        if (e.target.checked) {
          console.log("Toggle switched on, subscribing to OneSignal...");
          await this.subscribeToNotifications();
        } else {
          await this.unsubscribeFromNotifications();
        }
      });
    }

    if (this.testBtn) {
      this.testBtn.addEventListener("click", () => {
        this.sendTestNotification();
      });
    }

    if (this.saveBtn) {
      this.saveBtn.addEventListener("click", () => {
        this.updateNotificationTime();
      });
    }
  }

  async subscribeToNotifications() {
    if (!this.isMedianApp) {
      this.showStatus(
        "Native notifications are only available in the mobile app.",
        "error"
      );
      if (this.toggle) this.toggle.checked = false;
      return;
    }

    if (!this.oneSignalPlayerId) {
      await this.getOneSignalInfo();
    }

    if (!this.oneSignalPlayerId) {
      this.showStatus(
        "Unable to get OneSignal player ID. Please ensure notifications are enabled in device settings.",
        "error"
      );
      if (this.toggle) this.toggle.checked = false;
      return;
    }

    try {
      const notificationTime = this.timeInput ? this.timeInput.value : "09:00";

      const response = await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": this.getCSRFToken(),
        },
        body: JSON.stringify({
          oneSignalPlayerId: this.oneSignalPlayerId,
          deviceType: "median",
          notificationTime: notificationTime,
          provider: "onesignal",
        }),
      });

      const data = await response.json();

      if (data.status === "success") {
        this.showStatus(
          "Successfully subscribed to native notifications!",
          "success"
        );
        this.updateUIVisibility(true);
      } else {
        this.showStatus(`Failed to subscribe: ${data.message}`, "error");
        if (this.toggle) this.toggle.checked = false;
      }
    } catch (error) {
      console.error("Subscription error:", error);
      this.showStatus("Failed to subscribe to notifications.", "error");
      if (this.toggle) this.toggle.checked = false;
    }
  }

  async unsubscribeFromNotifications() {
    try {
      const response = await fetch("/api/notifications/unsubscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": this.getCSRFToken(),
        },
      });

      const data = await response.json();

      if (data.status === "success") {
        this.showStatus(
          "Successfully unsubscribed from notifications.",
          "success"
        );
        this.updateUIVisibility(false);
      } else {
        this.showStatus(`Failed to unsubscribe: ${data.message}`, "error");
      }
    } catch (error) {
      console.error("Unsubscription error:", error);
      this.showStatus("Failed to unsubscribe from notifications.", "error");
    }
  }

  async sendTestNotification() {
    if (!this.oneSignalPlayerId) {
      this.showStatus(
        "No OneSignal player ID available for test notification.",
        "error"
      );
      return;
    }

    try {
      const response = await fetch("/api/notifications/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": this.getCSRFToken(),
        },
      });

      const data = await response.json();

      if (data.status === "success") {
        this.showStatus(
          "Test notification sent! Check your device.",
          "success"
        );
      } else {
        this.showStatus(
          `Failed to send test notification: ${data.message}`,
          "error"
        );
      }
    } catch (error) {
      console.error("Test notification error:", error);
      this.showStatus("Failed to send test notification.", "error");
    }
  }

  async updateNotificationTime() {
    const newTime = this.timeInput ? this.timeInput.value : "09:00";

    try {
      const response = await fetch("/api/notifications/update-time", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": this.getCSRFToken(),
        },
        body: JSON.stringify({
          notificationTime: newTime,
        }),
      });

      const data = await response.json();

      if (data.status === "success") {
        this.showStatus(`Notification time updated to ${newTime}`, "success");
      } else {
        this.showStatus(`Failed to update time: ${data.message}`, "error");
      }
    } catch (error) {
      console.error("Update time error:", error);
      this.showStatus("Failed to update notification time.", "error");
    }
  }

  showStatus(message, type = "info") {
    if (!this.statusDiv) return;

    this.statusDiv.textContent = message;
    this.statusDiv.className = `notification-status ${type}`;

    // Auto-hide success messages after 5 seconds
    if (type === "success") {
      setTimeout(() => {
        if (this.statusDiv.textContent === message) {
          this.statusDiv.textContent = "";
          this.statusDiv.className = "notification-status";
        }
      }, 5000);
    }
  }

  updateUIVisibility(isSubscribed) {
    if (this.timeSettingDiv) {
      this.timeSettingDiv.style.display = isSubscribed ? "block" : "none";
    }

    if (this.testBtn) {
      this.testBtn.style.display = isSubscribed ? "inline-block" : "none";
    }
  }

  getCSRFToken() {
    const cookieValue = document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrftoken="))
      ?.split("=")[1];
    return cookieValue || "";
  }
}

// Global callback function for OneSignal info (called automatically by Median)
function median_onesignal_info(oneSignalInfo) {
  if (window.medianNotificationManager) {
    window.medianNotificationManager.handleOneSignalInfo(oneSignalInfo);
  }
}

// Function called when Median JavaScript Bridge is ready
function median_library_ready() {
  console.log("Median library ready");
  if (window.medianNotificationManager) {
    window.medianNotificationManager.setupMedianIntegration();
  }
}

// Initialize when DOM is ready (also if already loaded at dynamic import time)
function __initMedianNotifications() {
  if (!window.medianNotificationManager) {
    window.medianNotificationManager = new MedianNotificationManager();
    // If median bridge already present, trigger ready hook
    if (window.median && typeof window.median_library_ready === "function") {
      try {
        window.median_library_ready();
      } catch (e) {
        console.warn("Median library ready handler error", e);
      }
    }
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", __initMedianNotifications);
} else {
  __initMedianNotifications();
}
