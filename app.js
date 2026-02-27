import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import htm from 'htm';

const html = htm.bind(React.createElement);

const unitLabel = {
  celsius: 'Celsius (°C)',
  fahrenheit: 'Fahrenheit (°F)',
  kelvin: 'Kelvin (K)',
};

const unitSymbol = {
  celsius: '°C',
  fahrenheit: '°F',
  kelvin: 'K',
};

const toCelsius = {
  celsius: (value) => value,
  fahrenheit: (value) => (value - 32) * (5 / 9),
  kelvin: (value) => value - 273.15,
};

const fromCelsius = {
  celsius: (value) => value,
  fahrenheit: (value) => value * (9 / 5) + 32,
  kelvin: (value) => value + 273.15,
};

function formatNumber(value) {
  return Number.parseFloat(value.toFixed(2)).toString();
}

function App() {
  const [temperature, setTemperature] = useState('');
  const [fromUnit, setFromUnit] = useState('celsius');
  const [toUnit, setToUnit] = useState('fahrenheit');

  const conversionState = useMemo(() => {
    if (temperature.trim() === '') {
      return { message: 'Enter a value to convert.', isError: false };
    }

    const rawValue = Number(temperature);

    if (!Number.isFinite(rawValue)) {
      return { message: 'Please enter a valid number.', isError: true };
    }

    if (fromUnit === 'kelvin' && rawValue < 0) {
      return { message: 'Kelvin cannot be below 0.', isError: true };
    }

    const result = fromCelsius[toUnit](toCelsius[fromUnit](rawValue));

    if (toUnit === 'kelvin' && result < 0) {
      return {
        message: 'Result is below absolute zero, which is invalid.',
        isError: true,
      };
    }

    return {
      message: `${formatNumber(rawValue)} ${unitSymbol[fromUnit]} = ${formatNumber(result)} ${unitSymbol[toUnit]}`,
      isError: false,
    };
  }, [temperature, fromUnit, toUnit]);

  return html`
    <main className="converter-card">
      <h1>🌡️ Temperature Converter</h1>
      <p className="subtitle">React-based converter for Celsius, Fahrenheit, and Kelvin.</p>

      <div className="converter-form">
        <div>
          <label htmlFor="temperature-input">Temperature</label>
          <input
            id="temperature-input"
            type="number"
            step="any"
            value=${temperature}
            onChange=${(event) => setTemperature(event.target.value)}
            placeholder="Enter temperature"
          />
        </div>

        <div className="unit-row">
          <div>
            <label htmlFor="from-unit">From</label>
            <select id="from-unit" value=${fromUnit} onChange=${(event) => setFromUnit(event.target.value)}>
              ${Object.entries(unitLabel).map(
                ([value, label]) => html`<option key=${`from-${value}`} value=${value}>${label}</option>`
              )}
            </select>
          </div>

          <button
            type="button"
            id="swap-button"
            aria-label="Swap units"
            onClick=${() => {
              setFromUnit(toUnit);
              setToUnit(fromUnit);
            }}
          >
            ⇄
          </button>

          <div>
            <label htmlFor="to-unit">To</label>
            <select id="to-unit" value=${toUnit} onChange=${(event) => setToUnit(event.target.value)}>
              ${Object.entries(unitLabel).map(
                ([value, label]) => html`<option key=${`to-${value}`} value=${value}>${label}</option>`
              )}
            </select>
          </div>
        </div>
      </div>

      <section className=${`result ${conversionState.isError ? 'error' : ''}`} aria-live="polite">
        ${conversionState.message}
      </section>
    </main>
  `;
}

createRoot(document.getElementById('root')).render(html`<${App} />`);
