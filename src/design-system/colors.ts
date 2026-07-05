// Google Stitch UI inspired color tokens (HSL representation)
export const colors = {
  light: {
    background: '0 0% 100%',         // #ffffff
    foreground: '222.2 84% 4.9%',     // #020817
    card: '0 0% 100%',               // #ffffff
    cardForeground: '222.2 84% 4.9%', // #020817
    popover: '0 0% 100%',            // #ffffff
    popoverForeground: '222.2 84% 4.9%', // #020817
    primary: '221.2 83.2% 53.3%',    // Premium Healthcare Blue: #1d4ed8
    primaryForeground: '210 40% 98%', // #f8fafc
    secondary: '210 40% 96.1%',      // Light slate: #f1f5f9
    secondaryForeground: '222.2 47.4% 11.2%', // #0f172a
    muted: '210 40% 96.1%',          // #f1f5f9
    mutedForeground: '215.4 16.3% 46.9%', // #64748b
    accent: '142.1 76.2% 36.3%',     // Healing Emerald: #16a34a
    accentForeground: '355.7 100% 97.3%',
    destructive: '0 84.2% 60.2%',    // Warning Red: #ef4444
    destructiveForeground: '210 40% 98%',
    border: '214.3 31.8% 91.4%',     // #e2e8f0
    input: '214.3 31.8% 91.4%',      // #e2e8f0
    ring: '221.2 83.2% 53.3%',
  },
  dark: {
    background: '222.2 84% 4.9%',    // #020817
    foreground: '210 40% 98%',       // #f8fafc
    card: '222.2 84% 4.9%',
    cardForeground: '210 40% 98%',
    popover: '222.2 84% 4.9%',
    popoverForeground: '210 40% 98%',
    primary: '217.2 91.2% 59.8%',    // Electric Blue: #3b82f6
    primaryForeground: '222.2 47.4% 11.2%',
    secondary: '217.2 32.6% 17.5%',  // Dark slate: #1e293b
    secondaryForeground: '210 40% 98%',
    muted: '217.2 32.6% 17.5%',
    mutedForeground: '215 20.2% 65.1%', // Slate grey: #94a3b8
    accent: '142.1 70.6% 45.3%',     // Emerald: #10b981
    accentForeground: '144.3 60.7% 8.2%',
    destructive: '0 62.8% 30.6%',
    destructiveForeground: '210 40% 98%',
    border: '217.2 32.6% 17.5%',
    input: '217.2 32.6% 17.5%',
    ring: '224.3 76.3% 48%',
  }
} as const;
