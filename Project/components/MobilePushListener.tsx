"use client";

import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

export function MobilePushListener() {
    const { isSignedIn, user } = useUser();
    const [fcmToken, setFcmToken] = useState<string | null>(null);

    // 1. Register for Push (Android only)
    useEffect(() => {
        if (Capacitor.getPlatform() !== "android") return;

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
        const registrationListener = PushNotifications.addListener("registration", (token) => {
            console.log("Push Registration Token: ", token.value);
            // alert('Push Token: ' + token.value); // Optional debug
            setFcmToken(token.value);
        });

        const errorListener = PushNotifications.addListener("registrationError", (error) => {
            console.error("Push Registration Error: ", error);
            // toast.error("Push notification registration failed");
        });

        const receivedListener = PushNotifications.addListener("pushNotificationReceived", (notification) => {
            console.log("Push Received: ", notification);
            toast.info(notification.title || "New Notification", {
                description: notification.body,
            });
        });

        const actionListener = PushNotifications.addListener("pushNotificationActionPerformed", (notification) => {
            console.log("Push Action Performed: ", notification);
            // Navigate to specific page if needed
            // router.push(notification.notification.data.url)
        });

        return () => {
            registrationListener.then(handle => handle.remove());
            errorListener.then(handle => handle.remove());
            receivedListener.then(handle => handle.remove());
            actionListener.then(handle => handle.remove());
        };
    }, []);

    // 2. Sync Token with Backend when User Logs In
    useEffect(() => {
        if (!isSignedIn || !user || !fcmToken) return;

        const syncToken = async () => {
            try {
                const response = await fetch('/api/v1/user/push-token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        token: fcmToken,
                        platform: Capacitor.getPlatform()
                    })
                });

                if (response.ok) {
                    console.log("Push token synced with backend for user:", user.id);
                    // alert('Push Connected!'); // Verify once then remove
                } else {
                    console.error("Failed to sync push token:", await response.text());
                }
            } catch (e) {
                console.error("Network error syncing push token:", e);
            }
        };

        syncToken();
    }, [isSignedIn, user, fcmToken]);

    return null; // Invisible component
}
