/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{vue,js,ts,jsx,tsx}",
    "./node_modules/vue-tailwind-datepicker/**/*.js" // 如果使用日期选择器等第三方组件
  ],
  theme: {
    extend: {
      colors: {
        bg_color: "var(--el-bg-color)",
        //primary: "var(--el-color-primary)",
        text_color_primary: "var(--el-text-color-primary)",
        text_color_regular: "var(--el-text-color-regular)",
        primary: "#3b82f6",
        secondary: "#10b981",
        accent: "#ef4444",
        dark: "#1e293b",
        light: "#f8fafc"
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};
