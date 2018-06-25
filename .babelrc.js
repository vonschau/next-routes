const env = {
  "process.env.NODE_ENV": process.env.NODE_ENV
};

module.exports = {
  presets: [
    ["@babel/preset-env", { "modules": "commonjs" }],
    "next/babel"
  ],
  plugins: [
    ["transform-define", env]
  ]
};
