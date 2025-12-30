/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, useEffect } from 'react';

const CurrencyContext = createContext();

const defaultRates = {
    BRL: 1,
    USD: 0.17,
    EUR: 0.16,
};

const currencyLocales = {
    BRL: 'pt-BR',
    USD: 'en-US',
    EUR: 'de-DE',
};

export function CurrencyProvider({ children }) {
    const [currency, setCurrency] = useState(() => {
        return localStorage.getItem('currency') || 'BRL';
    });
    const [rates, setRates] = useState(defaultRates);

    useEffect(() => {
        localStorage.setItem('currency', currency);
    }, [currency]);

    // Fetch Rates on Mount
    useEffect(() => {
        const fetchRates = async () => {
            try {
                const response = await fetch('https://api.exchangerate-api.com/v4/latest/BRL');
                if (response.ok) {
                    const data = await response.json();
                    setRates({
                        BRL: 1,
                        USD: data.rates.USD,
                        EUR: data.rates.EUR,
                    });
                    console.log('Taxas de câmbio atualizadas:', data.rates);
                }
            } catch (error) {
                console.error('Erro ao buscar taxas de câmbio:', error);
                // Mantém os defaultRates se falhar
            }
        };

        fetchRates();
    }, []);

    const formatPrice = (valueInBrl) => {
        if (valueInBrl === undefined || valueInBrl === null || valueInBrl === '') return '';

        // Safely parse string inputs (e.g., "15,50" -> 15.50)
        let numericValue = valueInBrl;
        if (typeof valueInBrl === 'string') {
            numericValue = parseFloat(valueInBrl.replace(',', '.'));
        }

        if (isNaN(numericValue)) return '';

        const rate = rates[currency] || 1;
        const convertedValue = numericValue * rate;

        return new Intl.NumberFormat(currencyLocales[currency], {
            style: 'currency',
            currency: currency,
        }).format(convertedValue);
    };

    const value = {
        currency,
        setCurrency,
        exchangeRates: rates,
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
