// Smart notification loader - detects platform and initializes appropriate notification system
// This file decides whether to use FCM (for web) or OneSignal (for Median apps)

(function () {
  "use strict";

  function detectPlatform() {
    const userAgent = navigator.userAgent.toLowerCase();
    const hasMedian =
      window.median !== undefined || window.gonative !== undefined;
    const hasMedianAgent =
      userAgent.includes("median") || userAgent.includes("gonative");

    var osSubscriptionId = "the OneSignal Subscription ID string";
    var isSubscribedToPushNotifications;

    median.onesignal.onesignalInfo().then(function (oneSignalInfo) {
      console.log(oneSignalInfo);
      osSubscriptionId = oneSignalInfo.oneSignalUserId;
      isSubscribedToPushNotifications = oneSignalInfo.oneSignalSubscribed;
    });

    return {
      isMedian: hasMedian || hasMedianAgent,
      isWeb: !hasMedian && !hasMedianAgent,
      userAgent: userAgent,
    };
  }

  function loadScript(src, isModule = true) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      if (isModule) {
        script.type = "module";
      }
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async function initializeNotifications() {
    const platform = detectPlatform();
    console.log("Platform detection:", platform);

    try {
      if (platform.isMedian) {
        console.log(
          "Loading Median OneSignal notification system (non-module)..."
        );
        await loadScript("/static/notifications_median.js", false);
      } else {
        console.log("Loading web FCM notification system (ES module)...");
        await loadScript("/static/notifications_fcm.js", true);
      }
    } catch (error) {
      console.error("Failed to load notification system:", error);
      // Fallback to basic UI without notifications
      showNotificationStatus(
        "Push notifications are not available on this platform.",
        "warning"
      );
    }
  }

  function showNotificationStatus(message, type = "info") {
    const statusDiv = document.getElementById("notification-status");
    if (statusDiv) {
      statusDiv.textContent = message;
      statusDiv.className = `notification-status ${type}`;
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeNotifications);
  } else {
    initializeNotifications();
  }

  // Expose platform detection for other scripts
  window.ecotrackPlatform = detectPlatform();
})();
