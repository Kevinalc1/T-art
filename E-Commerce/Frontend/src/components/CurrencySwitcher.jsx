import React, { useEffect } from 'react';
import { useCurrency } from '../context/CurrencyContext.jsx';
import { useTranslation } from 'react-i18next';
import './CurrencySwitcher.css';

export default function CurrencySwitcher() {
    const { currency, setCurrency } = useCurrency();
    const { i18n } = useTranslation();

    // Sincroniza idioma com moeda (opcional, mas recomendado para UX)
    const handleCurrencyChange = (e) => {
        const newCurrency = e.target.value;
        setCurrency(newCurrency);

        // Mudar idioma baseado na moeda
        if (newCurrency === 'BRL') {
            i18n.changeLanguage('pt');
        } else if (newCurrency === 'USD') {
            i18n.changeLanguage('en');
        } else if (newCurrency === 'EUR') {
            i18n.changeLanguage('en'); // ou 'de', etc.
        }
    };

    // Opcional: Sincronizar reverso (se mudar idioma, mudar moeda?)
    // Por enquanto deixo apenas Moeda -> Idioma para não causar loops indesejados.

    return (
        <div className="currency-switcher">
            <select value={currency} onChange={handleCurrencyChange} className="currency-select" aria-label="Alterar Moeda">
                <option value="BRL">🇧🇷 BRL</option>
                <option value="USD">🇺🇸 USD</option>
                <option value="EUR">🇪🇺 EUR</option>
            </select>
        </div>
    );
}
