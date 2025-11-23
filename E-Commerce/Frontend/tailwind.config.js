/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}', // Garante que o Tailwind escaneie todos os seus arquivos de código
  ],
  theme: {
    extend: {
      // Aqui você pode estender o tema padrão do Tailwind.
      // Por exemplo, definindo as cores do seu projeto.
      colors: {
        primaria: '#1a1a1a', // Ex: Preto para textos principais
        secundaria: '#6b7280', // Ex: Cinza para textos secundários
        fundo: '#ffffff', // Ex: Branco para o fundo
        acento: '#f3f4f6', // Ex: Cinza claro para cards e fundos de seção
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Define 'Inter' como a fonte padrão
      },
    },
  },
  plugins: [],
};