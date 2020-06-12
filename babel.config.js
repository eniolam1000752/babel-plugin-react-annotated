const env = "test";

if (env === "test") {
  module.exports = function(api) {
    api.cache(false);

    const presets = [["@babel/preset-react"]];
    const plugins = [
      ["./babel-plugin/react-annotated", {}],
      ["@babel/plugin-syntax-class-properties"],
    ];

    return {
      presets,
      plugins,
      comments: false,
    };
  };
} else {
  module.exports = function(api) {
    api.cache(false);

    const presets = [["@babel/preset-env"]];
    const plugins = [];

    return {
      presets,
      plugins,
    };
  };
}
