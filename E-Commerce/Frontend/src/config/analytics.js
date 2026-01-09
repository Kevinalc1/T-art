/**
 * Analytics Configuration
 * 
 * Centralized configuration for Google Analytics 4 and Meta Pixel
 * IDs are loaded from environment variables for security
 */

export const analyticsConfig = {
    // Google Analytics 4 Measurement ID
    // Format: G-XXXXXXXXXX
    ga4MeasurementId: import.meta.env.VITE_GA4_MEASUREMENT_ID || '',

    // Meta (Facebook) Pixel ID
    // Format: numeric string
    metaPixelId: import.meta.env.VITE_META_PIXEL_ID || '',

    // Enable/disable tracking in development
    enableInDevelopment: import.meta.env.VITE_ENABLE_ANALYTICS_DEV === 'true',

    // Debug mode for testing
    debug: import.meta.env.MODE === 'development',
};

/**
 * Check if analytics should be enabled
 */
export const isAnalyticsEnabled = () => {
    const isDevelopment = import.meta.env.MODE === 'development';

    // In production, always enable if IDs are present
    if (!isDevelopment) {
        return !!(analyticsConfig.ga4MeasurementId || analyticsConfig.metaPixelId);
    }

    // In development, only enable if explicitly set
    return analyticsConfig.enableInDevelopment;
};

export default analyticsConfig;
