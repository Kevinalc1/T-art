import React from 'react';
import { useCurrency } from '../context/CurrencyContext';
import './CurrencySwitcher.css'; // We'll create this CSS file

export default function CurrencySwitcher() {
    const { currency, setCurrency } = useCurrency();

    const handleChange = (e) => {
        setCurrency(e.target.value);
    };

    return (
        <div className="currency-switcher">
            <select value={currency} onChange={handleChange} className="currency-select">
                <option value="BRL">BRL (R$)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
            </select>
        </div>
    );
}
