/**
 * Analytics Utility Functions
 * 
 * Centralized tracking for Google Analytics 4 and Meta Pixel
 * All e-commerce events follow GA4 and Meta standard event naming
 */

import ReactGA from 'react-ga4';
import ReactPixel from 'react-facebook-pixel';
import { analyticsConfig, isAnalyticsEnabled } from '../config/analytics.js';

let isInitialized = false;

/**
 * Initialize analytics services
 * Call this once when the app starts
 */
export const initializeAnalytics = () => {
    if (!isAnalyticsEnabled() || isInitialized) {
        return;
    }

    try {
        // Initialize Google Analytics 4
        if (analyticsConfig.ga4MeasurementId) {
            ReactGA.initialize(analyticsConfig.ga4MeasurementId, {
                gaOptions: {
                    debug_mode: analyticsConfig.debug,
                },
            });

            if (analyticsConfig.debug) {
                console.log('[Analytics] GA4 initialized:', analyticsConfig.ga4MeasurementId);
            }
        }

        // Initialize Meta Pixel
        if (analyticsConfig.metaPixelId) {
            const options = {
                autoConfig: true,
                debug: analyticsConfig.debug,
            };

            ReactPixel.init(analyticsConfig.metaPixelId, undefined, options);

            if (analyticsConfig.debug) {
                console.log('[Analytics] Meta Pixel initialized:', analyticsConfig.metaPixelId);
            }
        }

        isInitialized = true;
    } catch (error) {
        console.error('[Analytics] Initialization error:', error);
    }
};

/**
 * Track page view
 * @param {string} path - Page path (e.g., '/produto/123')
 * @param {string} title - Page title
 */
export const trackPageView = (path, title) => {
    if (!isAnalyticsEnabled()) return;

    try {
        // GA4 page view
        if (analyticsConfig.ga4MeasurementId) {
            ReactGA.send({ hitType: 'pageview', page: path, title });
        }

        // Meta Pixel page view
        if (analyticsConfig.metaPixelId) {
            ReactPixel.pageView();
        }

        if (analyticsConfig.debug) {
            console.log('[Analytics] Page view:', { path, title });
        }
    } catch (error) {
        console.error('[Analytics] Page view error:', error);
    }
};

/**
 * Track product view
 * @param {Object} product - Product object
 */
export const trackViewContent = (product) => {
    if (!isAnalyticsEnabled() || !product) return;

    try {
        const eventData = {
            currency: 'BRL',
            value: parseFloat(product.price) || 0,
            items: [
                {
                    item_id: product._id,
                    item_name: product.productName,
                    price: parseFloat(product.price) || 0,
                    quantity: 1,
                },
            ],
        };

        // GA4 view_item event
        if (analyticsConfig.ga4MeasurementId) {
            ReactGA.event('view_item', eventData);
        }

        // Meta Pixel ViewContent event
        if (analyticsConfig.metaPixelId) {
            ReactPixel.track('ViewContent', {
                content_name: product.productName,
                content_ids: [product._id],
                content_type: 'product',
                value: parseFloat(product.price) || 0,
                currency: 'BRL',
            });
        }

        if (analyticsConfig.debug) {
            console.log('[Analytics] View content:', product.productName);
        }
    } catch (error) {
        console.error('[Analytics] View content error:', error);
    }
};

/**
 * Track add to cart
 * @param {Object} product - Product object
 * @param {number} quantity - Quantity added
 */
export const trackAddToCart = (product, quantity = 1) => {
    if (!isAnalyticsEnabled() || !product) return;

    try {
        const eventData = {
            currency: 'BRL',
            value: parseFloat(product.price) * quantity || 0,
            items: [
                {
                    item_id: product._id,
                    item_name: product.productName,
                    price: parseFloat(product.price) || 0,
                    quantity: quantity,
                },
            ],
        };

        // GA4 add_to_cart event
        if (analyticsConfig.ga4MeasurementId) {
            ReactGA.event('add_to_cart', eventData);
        }

        // Meta Pixel AddToCart event
        if (analyticsConfig.metaPixelId) {
            ReactPixel.track('AddToCart', {
                content_name: product.productName,
                content_ids: [product._id],
                content_type: 'product',
                value: parseFloat(product.price) * quantity || 0,
                currency: 'BRL',
            });
        }

        if (analyticsConfig.debug) {
            console.log('[Analytics] Add to cart:', product.productName, 'x', quantity);
        }
    } catch (error) {
        console.error('[Analytics] Add to cart error:', error);
    }
};

/**
 * Track begin checkout
 * @param {Array} items - Cart items
 * @param {number} totalValue - Total cart value
 */
export const trackBeginCheckout = (items, totalValue) => {
    if (!isAnalyticsEnabled() || !items || items.length === 0) return;

    try {
        const eventData = {
            currency: 'BRL',
            value: totalValue,
            items: items.map((item) => ({
                item_id: item._id,
                item_name: item.productName,
                price: parseFloat(item.price) || 0,
                quantity: item.quantidade || 1,
            })),
        };

        // GA4 begin_checkout event
        if (analyticsConfig.ga4MeasurementId) {
            ReactGA.event('begin_checkout', eventData);
        }

        // Meta Pixel InitiateCheckout event
        if (analyticsConfig.metaPixelId) {
            ReactPixel.track('InitiateCheckout', {
                content_ids: items.map((item) => item._id),
                contents: items.map((item) => ({
                    id: item._id,
                    quantity: item.quantidade || 1,
                })),
                value: totalValue,
                currency: 'BRL',
                num_items: items.length,
            });
        }

        if (analyticsConfig.debug) {
            console.log('[Analytics] Begin checkout:', { items: items.length, value: totalValue });
        }
    } catch (error) {
        console.error('[Analytics] Begin checkout error:', error);
    }
};

/**
 * Track purchase completion
 * @param {string} transactionId - Order/transaction ID
 * @param {Array} items - Purchased items
 * @param {number} totalValue - Total purchase value
 */
export const trackPurchase = (transactionId, items, totalValue) => {
    if (!isAnalyticsEnabled() || !transactionId || !items || items.length === 0) return;

    try {
        const eventData = {
            transaction_id: transactionId,
            currency: 'BRL',
            value: totalValue,
            items: items.map((item) => ({
                item_id: item._id,
                item_name: item.productName,
                price: parseFloat(item.price) || 0,
                quantity: item.quantidade || 1,
            })),
        };

        // GA4 purchase event
        if (analyticsConfig.ga4MeasurementId) {
            ReactGA.event('purchase', eventData);
        }

        // Meta Pixel Purchase event
        if (analyticsConfig.metaPixelId) {
            ReactPixel.track('Purchase', {
                content_ids: items.map((item) => item._id),
                contents: items.map((item) => ({
                    id: item._id,
                    quantity: item.quantidade || 1,
                })),
                value: totalValue,
                currency: 'BRL',
                num_items: items.length,
            });
        }

        if (analyticsConfig.debug) {
            console.log('[Analytics] Purchase:', { transactionId, items: items.length, value: totalValue });
        }
    } catch (error) {
        console.error('[Analytics] Purchase error:', error);
    }
};

/**
 * Track custom event
 * @param {string} eventName - Event name
 * @param {Object} eventParams - Event parameters
 */
export const trackCustomEvent = (eventName, eventParams = {}) => {
    if (!isAnalyticsEnabled()) return;

    try {
        // GA4 custom event
        if (analyticsConfig.ga4MeasurementId) {
            ReactGA.event(eventName, eventParams);
        }

        // Meta Pixel custom event
        if (analyticsConfig.metaPixelId) {
            ReactPixel.trackCustom(eventName, eventParams);
        }

        if (analyticsConfig.debug) {
            console.log('[Analytics] Custom event:', eventName, eventParams);
        }
    } catch (error) {
        console.error('[Analytics] Custom event error:', error);
    }
};

export default {
    initializeAnalytics,
    trackPageView,
    trackViewContent,
    trackAddToCart,
    trackBeginCheckout,
    trackPurchase,
    trackCustomEvent,
};
