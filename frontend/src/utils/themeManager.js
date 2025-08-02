// Global theme management utility
export class ThemeManager {
  static THEME_KEY = 'theme';
  static THEME_CHANGE_EVENT = 'themechange';

  static initializeTheme() {
    if (typeof window === 'undefined') return 'light';
    
    // Get saved theme from localStorage
    const savedTheme = localStorage.getItem(this.THEME_KEY);
    
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      // Use saved theme
      window.globalTheme = savedTheme;
      console.log('🎨 ThemeManager: Using saved theme:', savedTheme);
      return savedTheme;
    } else {
      // Default to system preference
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      console.log('🎨 ThemeManager: No saved theme found, using system preference:', systemTheme);
      localStorage.setItem(this.THEME_KEY, systemTheme);
      window.globalTheme = systemTheme;
      return systemTheme;
    }
  }

  static setTheme(theme) {
    if (typeof window === 'undefined') return;
    
    if (theme !== 'light' && theme !== 'dark') {
      console.warn('🎨 ThemeManager: Invalid theme:', theme);
      return;
    }

    console.log('🎨 ThemeManager: Setting theme to:', theme);

    // Update localStorage
    localStorage.setItem(this.THEME_KEY, theme);
    
    // Update global theme
    window.globalTheme = theme;
    
    // Dispatch theme change event
    window.dispatchEvent(new CustomEvent(this.THEME_CHANGE_EVENT, { detail: { theme } }));
  }

  static getTheme() {
    if (typeof window === 'undefined') return 'light';
    return window.globalTheme || this.initializeTheme();
  }

  static addThemeChangeListener(callback) {
    if (typeof window === 'undefined') return () => {};
    
    const handleThemeChange = (event) => {
      callback(event.detail?.theme || window.globalTheme);
    };
    
    window.addEventListener(this.THEME_CHANGE_EVENT, handleThemeChange);
    
    // Return cleanup function
    return () => window.removeEventListener(this.THEME_CHANGE_EVENT, handleThemeChange);
  }
}

// Initialize theme immediately when this module is loaded
if (typeof window !== 'undefined') {
  ThemeManager.initializeTheme();
}