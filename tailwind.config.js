export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'hsl(214, 100%, 58%)',
        foreground: 'hsl(220, 14%, 95%)',
        muted: 'hsl(220, 20%, 42%)',
        destructive: 'hsl(357, 85%, 62%)',
        warning: 'hsl(33, 100%, 58%)',
        success: 'hsl(141, 71%, 48%)',
        info: 'hsl(189, 100%, 60%)',
      },
      boxShadow: {
        card: '0 20px 50px rgba(15,23,42,0.12)',
        glow: '0 0 30px rgba(59,130,246,0.18)',
        elevated: '0 28px 70px rgba(15,23,42,0.18)',
      },
    },
  },
  plugins: [],
};
