import nextConfig from "eslint-config-next";

const eslintConfig = [
  ...nextConfig,
  {
    ignores: ["node_modules/**"],
  },
  {
    rules: {
      "react-hooks/preserve-manual-memoization": "off",
    },
  },
];

export default eslintConfig;
