"use client";

import { useCallback } from 'react';

export function useAnalytics() {
  const trackEvent = useCallback(async (eventType: string, eventData: any = {}) => {
    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventType,
          eventData
        }),
      });
    } catch (error) {
      // Silently fail - don't disrupt user experience
      console.error('Analytics tracking failed:', error);
    }
  }, []);

  const trackPageView = useCallback((page: string) => {
    trackEvent('page_view', { page });
  }, [trackEvent]);

  const trackCompanionCreated = useCallback((companionId: string) => {
    trackEvent('companion_created', { companionId });
  }, [trackEvent]);

  const trackSessionStarted = useCallback((sessionId: string, companionId: string) => {
    trackEvent('session_started', { sessionId, companionId });
  }, [trackEvent]);

  const trackSessionEnded = useCallback((sessionId: string, duration: number) => {
    trackEvent('session_ended', { sessionId, duration });
  }, [trackEvent]);

  const trackBookmarkAdded = useCallback((companionId: string) => {
    trackEvent('bookmark_added', { companionId });
  }, [trackEvent]);

  const trackLearningLogCreated = useCallback((logId: string) => {
    trackEvent('learning_log_created', { logId });
  }, [trackEvent]);

  return {
    trackEvent,
    trackPageView,
    trackCompanionCreated,
    trackSessionStarted,
    trackSessionEnded,
    trackBookmarkAdded,
    trackLearningLogCreated
  };
}