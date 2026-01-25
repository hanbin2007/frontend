import { useEffect, useRef, useCallback } from "react";
import { useAppDispatch } from "../redux/hooks.ts";
import { addNotification, InboxNotification } from "../redux/globalStateSlice.ts";
import { triggerRefresh } from "../redux/portalSlice.ts";
import { ApiPrefix } from "../api/request.ts";
import SessionManager from "../session";

export const useNotificationSSE = () => {
  const dispatch = useAppDispatch();
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const isConnectingRef = useRef<boolean>(false);

  const connect = useCallback(async () => {
    // Prevent multiple simultaneous connection attempts
    if (isConnectingRef.current) {
      return;
    }

    try {
      isConnectingRef.current = true;
      const accessToken = await SessionManager.getAccessToken();
      if (!accessToken) {
        console.log("SSE: No access token, skipping connection");
        isConnectingRef.current = false;
        return;
      }

      // Close existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      // EventSource doesn't support custom headers, so we pass token as query param
      const url = `${ApiPrefix}/user/notifications/events?token=${encodeURIComponent(accessToken)}`;
      console.log("SSE: Connecting to", url.substring(0, 50) + "...");

      const eventSource = new EventSource(url);

      eventSource.onopen = () => {
        console.log("SSE: Connection opened");
        isConnectingRef.current = false;
      };

      eventSource.addEventListener("notification", (event) => {
        console.log("SSE: Received notification event", event.data);
        try {
          const notification = JSON.parse(event.data) as InboxNotification;

          // Handle portal task notifications - trigger refresh
          if (notification.type === "portal_task_updated" || notification.type === "portal_task_comment") {
            console.log("SSE: Portal task notification, triggering refresh");
            dispatch(triggerRefresh());
          }

          // Add all notifications to inbox
          dispatch(addNotification(notification));
          console.log("SSE: Notification dispatched to Redux", notification);
        } catch (e) {
          console.error("SSE: Failed to parse notification:", e);
        }
      });

      eventSource.addEventListener("subscribed", () => {
        console.log("SSE: Subscribed to notifications");
      });

      eventSource.addEventListener("resumed", () => {
        console.log("SSE: Resumed notification subscription");
      });

      eventSource.addEventListener("keep-alive", () => {
        console.log("SSE: Keep-alive received");
      });

      eventSource.onerror = (error) => {
        console.error("SSE: Connection error", error);
        console.log("SSE: readyState =", eventSource.readyState);
        isConnectingRef.current = false;

        // Only reconnect if not already closed
        if (eventSource.readyState === EventSource.CLOSED) {
          eventSource.close();
          eventSourceRef.current = null;

          // Reconnect after delay
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          console.log("SSE: Scheduling reconnect in 5s...");
          reconnectTimeoutRef.current = window.setTimeout(() => {
            connect();
          }, 5000);
        }
      };

      eventSourceRef.current = eventSource;
    } catch (e) {
      console.error("SSE: Failed to connect:", e);
      isConnectingRef.current = false;
    }
  }, [dispatch]);

  useEffect(() => {
    // Check if user is logged in before connecting
    try {
      SessionManager.currentLogin();
      connect();
    } catch (e) {
      console.log("SSE: User not logged in, skipping connection");
    }

    return () => {
      console.log("SSE: Cleanup - closing connection");
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  return {
    reconnect: connect,
  };
};
