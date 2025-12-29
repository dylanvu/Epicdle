"use client";
import { createContext, useContext, ReactNode, useEffect, useRef } from "react";
import { getFirebaseAnalytics } from "../config/firebase";
import type { Analytics } from "firebase/analytics";
import { logEvent as firebaseLogEvent } from "firebase/analytics";
import { usePathname } from "next/navigation";

const FirebaseAnalyticsContext =
  createContext<React.MutableRefObject<Analytics | null> | null>(null);

type FirebaseAnalyticsProviderProps = {
  children: ReactNode;
};

export function FirebaseAnalyticsProvider({
  children,
}: FirebaseAnalyticsProviderProps) {
  const analyticsRef = useRef<Analytics | null>(null);

  useEffect(() => {
    getFirebaseAnalytics().then((analytics) => {
      if (analytics) {
        analyticsRef.current = analytics;
      }
    });
  }, []);

  return (
    <FirebaseAnalyticsContext.Provider value={analyticsRef}>
      {children}
    </FirebaseAnalyticsContext.Provider>
  );
}

/**
 * Hook to access Firebase Analytics safely.
 * Returns a ref to the analytics instance AND a helper to log events safely.
 */
export function useFirebaseAnalytics() {
  const analyticsRef = useContext(FirebaseAnalyticsContext);
  const pathname = usePathname();
  if (!analyticsRef) {
    throw new Error(
      "useFirebaseAnalytics must be used within a FirebaseAnalyticsProvider"
    );
  }

  /**
   * Safe wrapper around logEvent
   * @param eventName Firebase Analytics event name
   * @param params Optional event parameters
   */
  function logEvent(eventName: string, params?: Record<string, any>) {
    if (analyticsRef && analyticsRef.current) {
      firebaseLogEvent(analyticsRef.current, eventName, {...params, page_path: pathname});
    } else {
      console.warn(`Analytics not ready yet. Event "${eventName}" not logged.`);
    }
  }

  return {
    analyticsRef,
    logEvent,
  };
}
