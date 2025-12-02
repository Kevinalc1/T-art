import React, { createContext, useState, useContext, useEffect } from 'react';

const CurrencyContext = createContext();

const exchangeRates = {
    BRL: 1,
    USD: 0.17, // Approximate rate
    EUR: 0.16, // Approximate rate
};

const currencyLocales = {
    BRL: 'pt-BR',
    USD: 'en-US',
    EUR: 'de-DE', // or en-IE, fr-FR, etc. de-DE is common for EUR
};

export function CurrencyProvider({ children }) {
    // Try to get from localStorage or default to BRL
    const [currency, setCurrency] = useState(() => {
        return localStorage.getItem('currency') || 'BRL';
    });

    useEffect(() => {
        localStorage.setItem('currency', currency);
    }, [currency]);

    const formatPrice = (valueInBrl) => {
        if (valueInBrl === undefined || valueInBrl === null) return '';

        const rate = exchangeRates[currency] || 1;
        const convertedValue = valueInBrl * rate;

        return new Intl.NumberFormat(currencyLocales[currency], {
            style: 'currency',
            currency: currency,
        }).format(convertedValue);
    };

    const value = {
        currency,
        setCurrency,
        exchangeRates,
        formatPrice,
    };

    return (
        <CurrencyContext.Provider value={value}>
            {children}
        </CurrencyContext.Provider>
    );
}

export function useCurrency() {
    return useContext(CurrencyContext);
}
