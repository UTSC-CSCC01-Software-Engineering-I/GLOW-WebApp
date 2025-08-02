// Global temperature unit management utility
export class UnitManager {
  static UNIT_KEY = 'temperatureUnit';
  static UNIT_CHANGE_EVENT = 'unitchange';

  static initializeUnit() {
    if (typeof window === 'undefined') return 'C';
    
    // Get saved unit from localStorage
    const savedUnit = localStorage.getItem(this.UNIT_KEY);
    
    if (savedUnit && (savedUnit === 'C' || savedUnit === 'F')) {
      // Use saved unit
      window.temperatureUnit = savedUnit;
      console.log('🌡️ UnitManager: Using saved unit:', savedUnit);
      return savedUnit;
    } else {
      // Default to Celsius
      const defaultUnit = 'C';
      console.log('🌡️ UnitManager: No saved unit found, using default:', defaultUnit);
      localStorage.setItem(this.UNIT_KEY, defaultUnit);
      window.temperatureUnit = defaultUnit;
      return defaultUnit;
    }
  }

  static setUnit(unit) {
    if (typeof window === 'undefined') return;
    
    if (unit !== 'C' && unit !== 'F') {
      console.warn('🌡️ UnitManager: Invalid unit:', unit);
      return;
    }

    console.log('🌡️ UnitManager: Setting unit to:', unit);

    // Update localStorage
    localStorage.setItem(this.UNIT_KEY, unit);
    
    // Update global unit
    window.temperatureUnit = unit;
    
    // Dispatch unit change event
    window.dispatchEvent(new CustomEvent(this.UNIT_CHANGE_EVENT, { detail: { unit } }));
  }

  static getUnit() {
    if (typeof window === 'undefined') return 'C';
    return window.temperatureUnit || this.initializeUnit();
  }

  static addUnitChangeListener(callback) {
    if (typeof window === 'undefined') return () => {};
    
    const handleUnitChange = (event) => {
      callback(event.detail?.unit || window.temperatureUnit);
    };
    
    window.addEventListener(this.UNIT_CHANGE_EVENT, handleUnitChange);
    
    // Return cleanup function
    return () => window.removeEventListener(this.UNIT_CHANGE_EVENT, handleUnitChange);
  }
}

// Initialize unit immediately when this module is loaded
if (typeof window !== 'undefined') {
  UnitManager.initializeUnit();
}