export type AnalyticsEventName =
  | 'tool_viewed'
  | 'tool_started'
  | 'space_dimensions_completed'
  | 'item_added'
  | 'layout_generated'
  | 'alternative_layout_viewed'
  | 'item_rotated'
  | 'layout_manually_edited'
  | 'layout_exported'
  | 'project_saved'
  | 'project_imported'
  | 'second_project_started'
  | 'no_fit_result'
  | 'measurement_error_shown'
  | 'example_opened';

type AnalyticsValue = string | number | boolean;
export type AnalyticsParameters = Record<string, AnalyticsValue>;

declare global {
  interface Window {
    shelfSketchAnalytics?: {
      track: (eventName: string, parameters?: AnalyticsParameters) => void;
      openPreferences: () => void;
      getConsent: () => 'granted' | 'denied' | 'unset';
    };
  }
}

export function trackEvent(eventName: AnalyticsEventName, parameters: AnalyticsParameters = {}): void {
  if (typeof window === 'undefined') return;
  window.shelfSketchAnalytics?.track(eventName, parameters);
}

export function broadCountBucket(count: number): string {
  if (count <= 0) return '0';
  if (count === 1) return '1';
  if (count <= 3) return '2-3';
  if (count <= 6) return '4-6';
  if (count <= 12) return '7-12';
  return '13+';
}

export function broadRatioBucket(ratio: number): string {
  if (ratio <= 0) return '0';
  if (ratio < 0.25) return '1-24';
  if (ratio < 0.5) return '25-49';
  if (ratio < 0.75) return '50-74';
  if (ratio < 1) return '75-99';
  return '100';
}

export function broadSizeBucket(widthMm: number, heightMm: number): string {
  const areaM2 = (widthMm * heightMm) / 1_000_000;
  if (areaM2 < 0.15) return 'small';
  if (areaM2 < 0.5) return 'medium';
  return 'large';
}
