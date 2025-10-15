// This uses 'require' (CommonJS) to fix the sub-directory module loading bug on Render.
const { defineConfig } = require('vite');
const react = require('@vitejs/plugin-react');
const tailwindcss = require('@tailwindcss/vite'); // Make sure all imports use require

// https://vitejs.dev/config/
module.exports = defineConfig({ // Use module.exports instead of export default
  plugins: [
    react(),
    tailwindcss(),
  ],
});