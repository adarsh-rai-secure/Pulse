import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          '"SF Mono"',
          'Menlo',
          'Consolas',
          'monospace',
        ],
      },
      colors: {
        ink: {
          900: '#0B0B14',
          700: '#2A2A3A',
          500: '#5A5A6E',
          400: '#8B8B9A',
          300: '#B5B5C0',
        },
        surface: {
          0: '#FFFFFF',
          50: '#F7F7FB',
          100: '#EFEFF5',
          200: '#E4E4EC',
        },
        brand: {
          50: '#F0ECFB',
          100: '#EEEDFE',
          200: '#C3B8F0',
          500: '#7F77DD',
          600: '#6E56CF',
          700: '#534AB7',
          900: '#1F1A66',
        },
        signal: {
          churnBg: '#FCEBEB',
          churnFg: '#B91C1C',
          churnBar: '#E24B4A',
          stuckBg: '#FAEEDA',
          stuckFg: '#B45309',
          stuckBar: '#EF9F27',
          sleepBg: '#EEEDFE',
          sleepFg: '#534AB7',
          sleepBar: '#7F77DD',
          refBg: '#EAF3DE',
          refFg: '#15803D',
          refBar: '#639922',
        },
      },
      fontSize: {
        '2xs': ['11px', { lineHeight: '14px' }],
        '13': ['13px', { lineHeight: '18px' }],
      },
      boxShadow: {
        card: '0 1px 0 rgba(11, 11, 20, 0.04), 0 1px 2px rgba(11, 11, 20, 0.04)',
        panel:
          '0 1px 0 rgba(11, 11, 20, 0.05), 0 4px 16px -8px rgba(11, 11, 20, 0.10)',
      },
    },
  },
  plugins: [],
};

export default config;
