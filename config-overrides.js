const webpack = require("webpack");

module.exports = function override(config, env) {
  // Add polyfills
  config.resolve.fallback = {
    ...config.resolve.fallback,
    buffer: require.resolve("buffer"),
    stream: require.resolve("stream-browserify"),
  };

  // Add plugins
  config.plugins.push(
    new webpack.ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
      process: "process/browser",
    })
  );

  return config;
};