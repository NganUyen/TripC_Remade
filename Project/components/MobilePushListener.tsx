"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";
import { toast } from "sonner";

export function MobilePushListener() {
    useEffect(() => {
        if (Capacitor.getPlatform() !== "android") {
            return; // Only run on Android native
        }

        const registerPush = async () => {
            let permStatus = await PushNotifications.checkPermissions();

            if (permStatus.receive === "prompt") {
                permStatus = await PushNotifications.requestPermissions();
            }

            if (permStatus.receive !== "granted") {
                console.warn("User denied push notifications");
                return;
            }

            await PushNotifications.createChannel({
                id: 'default',
                name: 'Default Channel',
                description: 'General Notifications',
                importance: 5,
                visibility: 1,
                vibration: true,
            });

            await PushNotifications.register();
        };

        registerPush();

        // Listeners
        PushNotifications.addListener("registration", async (token) => {
            console.log("Push Registration Token: ", token.value);
            alert('Push Token: ' + token.value);

            // Save token to backend
            // Save token to backend
            try {
                const response = await fetch('/api/v1/user/push-token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        token: token.value,
                        platform: Capacitor.getPlatform()
                    })
                });

                if (response.ok) {
                    alert('Backend Success: Token Saved!');
                } else {
                    const err = await response.text();
                    alert('Backend Error: ' + err);
                }
                console.log("Push token saved to backend");
            } catch (e) {
                alert('Network Error saving token: ' + String(e));
                console.error("Failed to save push token", e);
            }
        });

        PushNotifications.addListener("registrationError", (error) => {
            console.error("Push Registration Error: ", error);
            // toast.error("Push notification registration failed");
        });

        PushNotifications.addListener("pushNotificationReceived", (notification) => {
            console.log("Push Received: ", notification);
            toast.info(notification.title || "New Notification", {
                description: notification.body,
            });
        });

        PushNotifications.addListener("pushNotificationActionPerformed", (notification) => {
            console.log("Push Action Performed: ", notification);
            // Navigate to specific page if needed
            // router.push(notification.notification.data.url)
        });

        return () => {
            PushNotifications.removeAllListeners();
        };
    }, []);

    return null; // Invisible component
}
