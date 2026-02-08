/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // --- VERDES DA LIVO ---
        // Substitui o 'emerald' padrão pela sua nova paleta
        emerald: {
          50: '#F5F9F4',  // Fundo muito claro (baseado no verde claro)
          100: '#E4F0DE', // Fundo claro
          200: '#C1DBB3', // ✅ SEU VERDE CLARO (Selos, fundos de ícones)
          300: '#9FCBA0',
          400: '#7EBC89', // ✅ SEU VERDE INTERMEDIÁRIO (Gráficos, destaques)
          500: '#509464',
          600: '#236C3F', // ✅ SEU VERDE ESCURO (Botão Principal, Textos Fortes)
          700: '#1C5632', // Hover do botão (um pouco mais escuro que o oficial)
          800: '#154126',
          900: '#0E2B19',
        },
        // --- LARANJAS DA LIVO (Substituindo o Vermelho) ---
        // A Livo usa Laranja onde seria "Perigo/Venda", então sobrescrevemos o 'red'
        red: {
          50: '#FEF6F4',
          100: '#FDEBE8',
          200: '#FAD2C9',
          300: '#F69065', // ✅ SEU LARANJA SUAVE (Alertas leves)
          400: '#F27D60',
          500: '#ED6B5A', // ✅ SEU LARANJA FORTE (Atenção, Venda)
          600: '#D65A4A', // Hover do botão de venda (um pouco mais escuro)
          700: '#B04639',
          800: '#8A352B',
          900: '#64251E',
        },
        // Também mapeamos o orange para garantir
        orange: {
          300: '#F69065',
          500: '#ED6B5A',
        }
      }
    },
  },
  plugins: [],
}
