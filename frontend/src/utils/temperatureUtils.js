// Temperature conversion utilities

/**
 * Convert temperature from Celsius to Fahrenheit
 * @param {number} celsius - Temperature in Celsius
 * @returns {number} Temperature in Fahrenheit
 */
export function celsiusToFahrenheit(celsius) {
  return (parseFloat(celsius) * 9/5) + 32;
}

/**
 * Convert temperature from Fahrenheit to Celsius
 * @param {number} fahrenheit - Temperature in Fahrenheit
 * @returns {number} Temperature in Celsius
 */
export function fahrenheitToCelsius(fahrenheit) {
  return (parseFloat(fahrenheit) - 32) * 5/9;
}

/**
 * Convert temperature to the specified unit
 * @param {number} temperature - Temperature value (assumed to be in Celsius from database)
 * @param {string} targetUnit - Target unit ('C' or 'F')
 * @returns {number} Converted temperature
 */
export function convertTemperature(temperature, targetUnit) {
  const temp = parseFloat(temperature);
  if (isNaN(temp)) return 0;
  
  // Assume database stores temperatures in Celsius
  if (targetUnit === 'F') {
    return celsiusToFahrenheit(temp);
  }
  return temp; // Already in Celsius
}

/**
 * Format temperature with unit symbol
 * @param {number} temperature - Temperature value (assumed to be in Celsius from database)
 * @param {string} unit - Unit ('C' or 'F')
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} Formatted temperature string (e.g., "25.0°C", "77.0°F")
 */
export function formatTemperature(temperature, unit = 'C', decimals = 1) {
  const convertedTemp = convertTemperature(temperature, unit);
  return `${convertedTemp.toFixed(decimals)}°${unit}`;
}

/**
 * Convert temperature value for form input (when user is editing in different unit)
 * @param {number} temperature - Temperature value from database (in Celsius)
 * @param {string} currentUnit - Current unit setting ('C' or 'F')
 * @returns {number} Temperature value for input field
 */
export function getTemperatureForInput(temperature, currentUnit) {
  return convertTemperature(temperature, currentUnit);
}

/**
 * Convert temperature value from input form back to database format (Celsius)
 * @param {number} temperature - Temperature value from input field
 * @param {string} inputUnit - Unit the user entered the temperature in ('C' or 'F')
 * @returns {number} Temperature in Celsius for database storage
 */
export function convertTemperatureForStorage(temperature, inputUnit) {
  const temp = parseFloat(temperature);
  if (isNaN(temp)) return 0;
  
  if (inputUnit === 'F') {
    return fahrenheitToCelsius(temp);
  }
  return temp; // Already in Celsius
}