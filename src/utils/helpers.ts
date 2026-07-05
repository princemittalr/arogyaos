// Standard collection of functional helper algorithms
export const helpers = {
  // Generate random avatar abbreviations
  getInitials: (name: string): string => {
    if (!name) return '';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  },

  // Delay utility for mock simulation
  sleep: (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },

  // Truncate strings cleanly
  truncateString: (str: string, maxLength = 60): string => {
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength - 3) + '...';
  },

  // Safe JSON Parsing helper
  safeJsonParse: <T>(jsonString: string, fallbackValue: T): T => {
    try {
      return JSON.parse(jsonString) as T;
    } catch {
      return fallbackValue;
    }
  },
};

export default helpers;
