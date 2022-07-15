const path = require("path");

module.exports = {
  entry: "./src/index.ts",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "phocas-phlag.bundle.js",
    iife: true,
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      { test: /\.ts$/, use: "ts-loader" },
    ],
  },
  resolve: {
    extensions: [".ts", ".css"],
  },
  mode: "production",
};
