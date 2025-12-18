import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationEN from './locales/en/translation.json';
import translationPT from './locales/pt/translation.json';

// Configuração das traduções
const resources = {
    en: {
        translation: translationEN,
    },
    pt: {
        translation: translationPT,
    },
};

i18n
    .use(LanguageDetector) // Detecta o idioma do navegador
    .use(initReactI18next) // Integração com React
    .init({
        resources,
        fallbackLng: 'pt', // Idioma padrão caso a detecção falhe
        debug: true, // Útil para dev, mostra logs no console

        interpolation: {
            escapeValue: false, // React já protege contra XSS
        },

        detection: {
            order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
            caches: ['localStorage', 'cookie'],
        }
    });

export default i18n;
