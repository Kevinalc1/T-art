import { useEffect } from 'react';

/**
 * Hook customizado para interagir com o window.dataLayer do Google Analytics 4.
 * Inicializa o dataLayer caso não exista.
 */
export const useDataLayer = () => {

    useEffect(() => {
        if (!window.dataLayer) {
            window.dataLayer = [];
        }
    }, []);

    /**
     * Envia um evento para o dataLayer seguindo o schema do GA4.
     * @param {string} eventName - Nome do evento (ex: 'view_item', 'add_to_cart')
     * @param {object} data - Objeto de dados do evento (ecommerce data)
     */
    const pushEvent = (eventName, data) => {
        if (!window.dataLayer) {
            window.dataLayer = [];
        }

        window.dataLayer.push({
            event: eventName,
            ecommerce: data
        });

        // Log para debug em desenvolvimento (opcional)
        if (import.meta.env.DEV) {
            console.log(`[GA4] Evento '${eventName}' disparado:`, data);
        }
    };

    return { pushEvent };
};
