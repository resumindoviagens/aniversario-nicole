import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: { colors: { nicolePink: "#E91E63", nicoleBlue: "#0D1B4C", nicoleGold: "#FBB400", nicoleSoft: "#FFF3F7" } } },
  plugins: []
};
export default config;
