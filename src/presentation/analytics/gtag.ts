"use client";

// Centralized Google Analytics helpers (GA4).
// Safe no-ops when GA is not configured or gtag isn't available.

declare global {
  interface Window {
    gtag?: (command: 'config' | 'event', targetId: string, params?: Record<string, unknown>) => void;
  }
}

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || '';

export function isAnalyticsEnabled(): boolean {
  return typeof window !== 'undefined' && !!GA_ID && typeof window.gtag === 'function';
}

export function pageview(url: string): void {
  if (!isAnalyticsEnabled()) return;
  window.gtag?.('config', GA_ID, { page_path: url });
}

export type AnalyticsEventParams = {
  event_category?: string;
  event_label?: string;
  value?: number;
  [key: string]: unknown;
};

export function trackEvent(action: string, params?: AnalyticsEventParams): void {
  if (!isAnalyticsEnabled()) return;
  window.gtag?.('event', action, params);
}

export function trackClick(label: string, params?: AnalyticsEventParams): void {
  trackEvent('click', { event_label: label, ...params });
}

export function setUserId(userId: string): void {
  if (!isAnalyticsEnabled()) return;
  window.gtag?.('config', GA_ID, { user_id: userId });
}
