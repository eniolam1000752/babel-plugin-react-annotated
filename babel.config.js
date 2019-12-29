module.exports = function(api) {
  api.cache(false);

  const presets = [["@babel/preset-react"]];
  const plugins = [["./babel-plugin/react-annotation", {}]];

  return {
    presets,
    plugins
  };
};
