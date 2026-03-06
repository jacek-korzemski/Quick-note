export const theme = {
  colors: {
    // Główne kolory
    primary: '#0078d4',
    primaryHover: '#1084d8',
    primaryActive: '#006cbd',
    
    secondary: '#3c3c3c',
    secondaryHover: '#454545',
    secondaryActive: '#333333',
    
    tertiary: '#2d2d2d',
    tertiaryHover: '#363636',
    tertiaryActive: '#252525',
    
    // Tło
    background: '#1e1e1e',
    backgroundLight: '#252526',
    backgroundLighter: '#2d2d30',
    
    // Surface
    surface: '#252526',
    surfaceHover: '#2a2d2e',
    surfaceActive: '#37373d',
    
    // Border
    border: '#3c3c3c',
    borderLight: '#454545',
    borderFocus: '#007acc',
    
    // Tekst
    text: '#cccccc',
    textLight: '#e0e0e0',
    textSecondary: '#858585',
    textMuted: '#6e6e6e',
    textDisabled: '#5a5a5a',
    
    // Statusy
    success: '#4caf50',
    successLight: '#81c784',
    successDark: '#388e3c',
    
    warning: '#ff9800',
    warningLight: '#ffb74d',
    warningDark: '#f57c00',
    
    error: '#f44336',
    errorLight: '#e57373',
    errorDark: '#d32f2f',
    
    info: '#2196f3',
    infoLight: '#64b5f6',
    infoDark: '#1976d2',
    
    // Overlay
    overlay: 'rgba(0, 0, 0, 0.5)',
    overlayLight: 'rgba(0, 0, 0, 0.3)',
  },
  
  spacing: {
    xxs: '2px',
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    xxl: '32px',
    xxxl: '48px',
  },
  
  borderRadius: {
    xs: '2px',
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    full: '9999px',
  },
  
  fontSize: {
    xs: '10px',
    sm: '11px',
    md: '12px',
    lg: '13px',
    xl: '14px',
    xxl: '16px',
    xxxl: '20px',
    title: '24px',
  },
  
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  fontFamily: {
    sans: "'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif",
    mono: "'Fira Code', 'Consolas', 'Monaco', 'Courier New', monospace",
  },
  
  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.3)',
    md: '0 4px 12px rgba(0, 0, 0, 0.4)',
    lg: '0 8px 24px rgba(0, 0, 0, 0.5)',
    xl: '0 12px 48px rgba(0, 0, 0, 0.6)',
    glow: '0 0 20px rgba(0, 120, 212, 0.3)',
  },
  
  transitions: {
    fast: '100ms ease',
    normal: '200ms ease',
    slow: '300ms ease',
    bounce: '300ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  
  zIndex: {
    base: 1,
    dropdown: 100,
    sticky: 200,
    modal: 300,
    popover: 400,
    tooltip: 500,
    snackbar: 600,
  },
  
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    xxl: '1536px',
  },
} as const;

export type Theme = typeof theme;